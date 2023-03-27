import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability} from '../lib/attributeDevice';

export default async function initMeasureHumidityDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId = 'measure_humidity',
  endpointId?: number,
): Promise<void> {
  await initReadOnlyCapability(
    device,
    zclNode,
    capabilityId,
    CLUSTER.RELATIVE_HUMIDITY_MEASUREMENT,
    'measuredValue',
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
    10,
    undefined,
    endpointId,
  );
}
