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
    10,
    undefined,
    endpointId,
  );
}
