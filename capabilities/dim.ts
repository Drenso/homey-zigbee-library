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
    async (value: number): Promise<{ transitionTime: number, level: number }> => {
      await device.setCapabilityValue('onoff', value > 0);

      return {
        level: Math.round(value * maxDimValue),
        transitionTime: 0xFFFF,
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
