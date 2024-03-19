import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {
  DefaultConfiguration,
  initReadCommandCapability,
  ReportingConfiguration,
} from '../lib/attributeDevice';

type ArgumentOverrides = DefaultConfiguration & ReportingConfiguration & {
  pollInterval?: number,
}

export default async function initOnOffDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'onoff',
    endpointId,
    minInterval,
    maxInterval,
    minChange,
    pollInterval,
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
    {minInterval, maxInterval, minChange},
    endpointId,
    pollInterval,
  );
}
