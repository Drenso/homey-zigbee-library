import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability} from '../lib/attributeDevice';

export default async function initMeasureTemperatureDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  endpointId?: number,
): Promise<void> {
  await initReadOnlyCapability(
    device,
    zclNode,
    'measure_temperature',
    CLUSTER.TEMPERATURE_MEASUREMENT,
    'measuredValue',
    (value: number) => Math.round((value / 100) * 10) / 10,
    30,
    undefined,
    endpointId,
  );
}
