import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadWriteCapability} from '../lib/attributeDevice';

export default async function initDimDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId = 'dim',
  maxDim?: number,
  minChange?: number,
  endpointId?: number,
): Promise<void> {
  const maxDimValue = maxDim ?? 254;
  await initReadWriteCapability(
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
    async (value: number): Promise<number> => {
      await device.setCapabilityValue('onoff', value > 0);

      return value / maxDimValue;
    },
    minChange,
    endpointId,
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
