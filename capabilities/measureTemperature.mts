import type { ZigBeeDevice } from 'homey-zigbeedriver';
import zbClusters, { type ZCLNode } from 'zigbee-clusters';
import type { AttributeConfiguration } from '../lib/attributeDevice.mjs';
import { initReadOnlyCapability } from '../lib/attributeDevice.mjs';

type ArgumentOverrides = AttributeConfiguration;

export default async function initMeasureTemperatureDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'measure_temperature',
    cluster = zbClusters.CLUSTER.TEMPERATURE_MEASUREMENT,
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
      if (value < -0x154d || value > 0x7ffe) {
        device.error('Temperature value outside valid range');
        return null;
      }

      // MeasuredValue represents the temperature in degrees Celsius as follows:
      // MeasuredValue = 100 x Temperature in degrees Celsius
      return Math.round((value / 100) * 10) / 10;
    },
    { minInterval, maxInterval, minChange },
    endpointId,
  );
}
