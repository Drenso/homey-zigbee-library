import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import initFactorImplementation, {ZigbeeFactorDevice} from '../lib/helper/deviceFactor';

type ArgumentOverrides = {
  endpointId?: number,
  noPowerFactorReporting?: boolean,
}

export default async function initMeteringDevice(
  device: ZigbeeFactorDevice,
  zclNode: ZCLNode,
  {
    endpointId,
    noPowerFactorReporting,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  if (device.hasCapability('meter_power')) {
    device.log('Initialising meter_power capability');

    await initFactorImplementation(device, zclNode, 'meter_power', CLUSTER.METERING, 'meteringFactor', endpointId, noPowerFactorReporting)
      .then(() => device.log('Initialised meter_power capability'))
      .catch(e => device.error('Failed to initialise meter_power capability', e));
  }

  device.log('Metering device initialised!');
}
