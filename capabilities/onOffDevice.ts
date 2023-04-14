import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadWriteCapability} from '../lib/attributeDevice';

type ArgumentOverrides = {
  capabilityId: string,
  endpointId?: number,
}

export default async function initOnOffDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'onoff',
    endpointId,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  const set = (value: boolean): string => value ? 'setOn' : 'setOff';
  // Return empty object, the command specifies the action for this cluster ('setOn'/setOff')
  const setParser = (): Record<string, never> => ({});

  const reportParser = (value: boolean): boolean => value;

  await initReadWriteCapability(
    device,
    zclNode,
    capabilityId,
    CLUSTER.ON_OFF,
    set,
    setParser,
    'onOff',
    reportParser,
    undefined,
    endpointId,
  );
}
