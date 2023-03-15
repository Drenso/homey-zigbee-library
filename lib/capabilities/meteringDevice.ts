import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import initFactorImplementation, {ZigbeeFactorDevice} from '../helper/deviceFactor';

export default async function initMeteringDevice(
  device: ZigbeeFactorDevice,
  zclNode: ZCLNode,
): Promise<void> {
  if (device.hasCapability('meter_power')) {
    device.log('Initialising meter_power capability');

    await initFactorImplementation(
      device, zclNode, 'meteringFactor', 'meter_power', CLUSTER.METERING,
    )
      .then(() => device.log('Initialised meter_power capability'))
      .catch(e => device.error('Failed to initialise meter_power capability', e));
  }

  device.log('Metering device initialised!');
}
