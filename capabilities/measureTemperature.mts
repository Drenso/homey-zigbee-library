import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability, AttributeConfiguration} from '../lib/attributeDevice.mjs';

type ArgumentOverrides = AttributeConfiguration;

export default async function initMeasureTemperatureDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'measure_temperature',
    cluster = CLUSTER.TEMPERATURE_MEASUREMENT,
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
      // Value comes from int16
      // Check for invalid values
      if (value == 0x8000) return null;
      if (value < -0x154D || value > 0x7FFE) {
        device.error('Temperature value outside valid range');
        return null;
      }

      // MeasuredValue represents the temperature in degrees Celsius as follows:
      // MeasuredValue = 100 x Temperature in degrees Celsius
      return Math.round((value / 100) * 10) / 10;
    },
    {minInterval, maxInterval, minChange},
    endpointId,
  );
}
