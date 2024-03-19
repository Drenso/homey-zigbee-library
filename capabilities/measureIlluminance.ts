import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability, AttributeConfiguration} from '../lib/attributeDevice';

type ArgumentOverrides = AttributeConfiguration;

export default async function initMeasureIlluminanceDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'measure_luminance',
    cluster = CLUSTER.ILLUMINANCE_MEASUREMENT,
    attributeName = 'measuredValue',
    minChange = 1000,
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
    (value: number): number | null => {
      // Value comes from uint16
      // Check for special values
      if (value == 0xFFFF) return null;
      if (value == 0x0000) return 0;
      if (value < 0x0000 || value > 0xFFFF) {
        device.error('Illuminance value outside valid range');
        return null;
      }

      // MeasuredValue represents the Illuminance in Lux (symbol lx) as follows:
      // MeasuredValue = 10,000 x log10 Illuminance + 1
      return Math.round(10 ** ((value - 1) / 10000));
    },
    {minInterval, maxInterval, minChange},
    endpointId,
  );
}
