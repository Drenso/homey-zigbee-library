import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import initFactorImplementation, {ZigbeeFactorDevice} from '../helper/deviceFactor';

export default async function initElectricalMeasurementDevice(
  device: ZigbeeFactorDevice,
  zclNode: ZCLNode,
  endpointId?: number,
): Promise<void> {
  if (device.hasCapability('measure_voltage')) {
    device.log('Initialising measure_voltage capability');

    await initFactorImplementation(device, zclNode, 'measure_voltage', CLUSTER.ELECTRICAL_MEASUREMENT, 'acVoltageFactor', endpointId)
      .then(() => device.log('Initialised measure_voltage capability'))
      .catch(e => device.error('Failed to initialise measure_voltage capability', e));
  }

  if (device.hasCapability('measure_current')) {
    device.log('Initialising measure_current capability');

    await initFactorImplementation(device, zclNode, 'measure_current', CLUSTER.ELECTRICAL_MEASUREMENT, 'acCurrentFactor', endpointId)
      .then(() => device.log('Initialised measure_current capability'))
      .catch(e => device.error('Failed to initialise measure_current capability', e));
  }

  if (device.hasCapability('measure_power')) {
    device.log('Initialising measure_power capability');

    await initFactorImplementation(device, zclNode, 'measure_power', CLUSTER.ELECTRICAL_MEASUREMENT, 'activePowerFactor', endpointId)
      .then(() => device.log('Initialised measure_power capability'))
      .catch(e => device.error('Failed to initialise measure_power capability', e));
  }

  device.log('Electrical measurement device initialized!');
}
