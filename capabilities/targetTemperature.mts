import {
  initReadWriteCapability,
  AttributeConfiguration,
} from '../lib/attributeDevice.mjs';
import {ZigBeeDevice} from 'homey-zigbeedriver';
import zbClusters, {type ZCLNode} from 'zigbee-clusters';

type ArgumentOverrides = AttributeConfiguration;

export default async function initTargetTemperatureDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'target_temperature',
    cluster = zbClusters.CLUSTER.THERMOSTAT,
    attributeName = 'occupiedHeatingSetpoint',
    minChange = 10,
    minInterval,
    maxInterval,
    endpointId,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  await initReadWriteCapability(
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
    (value) => Math.round(value * 100),
    {minChange, minInterval, maxInterval},
    endpointId,
  );
}
