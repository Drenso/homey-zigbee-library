import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadCommandCapability} from '../lib/attributeDevice';

type ArgumentOverrides = {
  capabilityId: string,
  onOffCapabilityId: string | false,
  maxDimValue: number,
  maxInterval?: number,
  minChange?: number,
  endpointId?: number,
}

export default async function initDimDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'dim',
    onOffCapabilityId = 'onoff',
    maxDimValue = 0xFE,
    maxInterval,
    minChange,
    endpointId,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  await initReadCommandCapability(
    device,
    zclNode,
    capabilityId,
    CLUSTER.LEVEL_CONTROL,
    'moveToLevelWithOnOff',
    async (value: number, opts: {duration?: number}): Promise<{ transitionTime: number, level: number }> => {
      return {
        level: Math.round(value * maxDimValue),
        transitionTime: calculateDimDuration(opts?.duration),
      };
    },
    'currentLevel',
    async (value: number): Promise<number | null> => {
      // Value comes from uint8
      // Check for valid values
      if (value < 0 || value > maxDimValue) {
        device.error('Dim value outside valid range');
        return null;
      }

      if (onOffCapabilityId !== false) {
        await device.setCapabilityValue(onOffCapabilityId, value > 0);
      }

      return value / maxDimValue;
    },
    minChange,
    endpointId,
    maxInterval,
  );
}

function calculateDimDuration(durationSetting: number | undefined): number {
  if (durationSetting === undefined) {
    // Use the default transition time of the device
    return 0xFFFF;
  }

  // Convert from milliseconds to tenth of second, then cap the range between 0 and 65534
  return Math.max(Math.min(durationSetting / 100, 65534), 0);
}
