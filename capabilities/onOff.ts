import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadCommandCapability} from '../lib/attributeDevice';

type ArgumentOverrides = {
  capabilityId: string,
  endpointId?: number,
  maxInterval?: number,
}

export default async function initOnOffDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'onoff',
    endpointId,
    maxInterval,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  const command = (value: boolean): string => value ? 'setOn' : 'setOff';
  // Return empty object, the command specifies the action for this cluster ('setOn'/setOff')
  const commandArgParser = (): Record<string, never> => ({});

  const reportParser = (value: boolean): boolean => value;

  await initReadCommandCapability(
    device,
    zclNode,
    capabilityId,
    CLUSTER.ON_OFF,
    command,
    commandArgParser,
    'onOff',
    reportParser,
    undefined,
    endpointId,
    maxInterval,
  );
}
