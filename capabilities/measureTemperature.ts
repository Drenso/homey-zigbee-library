import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability} from '../lib/attributeDevice';

export default async function initMeasureTemperatureDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId = 'measure_temperature',
  endpointId?: number,
): Promise<void> {
  await initReadOnlyCapability(
    device,
    zclNode,
    capabilityId,
    CLUSTER.TEMPERATURE_MEASUREMENT,
    'measuredValue',
    (value: number) => Math.round((value / 100) * 10) / 10,
    10,
    undefined,
    endpointId,
  );
}
