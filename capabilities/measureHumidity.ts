import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability, AttributeConfiguration} from '../lib/attributeDevice';

type ArgumentOverrides = AttributeConfiguration;

export default async function initMeasureHumidityDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'measure_humidity',
    cluster = CLUSTER.RELATIVE_HUMIDITY_MEASUREMENT,
    attributeName = 'measuredValue',
    minChange = 10,
    minInterval,
    maxInterval,
    endpointId,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  await initReadOnlyCapability(
    device,
    zclNode,
    capabilityId,
    cluster,
    attributeName,
    (value: number) => {
      // Value comes from uint16
      // Check for invalid values
      if (value == 0xFFFF) return null;
      if (value < 0x0000 || value > 0x2710) {
        device.error('Humidity value outside valid range');
        return null;
      }

      // MeasuredValue represents the relative humidity in % as follows:
      // MeasuredValue = 100 x Relative humidity
      return Math.round((value / 100) * 10) / 10;
    },
    {minInterval, maxInterval, minChange},
    endpointId,
  );
}
