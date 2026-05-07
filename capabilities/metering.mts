import zbClusters, { type ZCLNode } from 'zigbee-clusters';
import type { ZigbeeFactorDevice } from '../lib/helper/deviceFactor.mjs';
import initFactorImplementation from '../lib/helper/deviceFactor.mjs';

type ArgumentOverrides<Postfix extends string> = {
  endpointId?: number;
  noPowerFactorReporting?: boolean;
  storePropertyPostfix?: Postfix;
};

export default async function initMeteringDevice<Postfix extends string = ''>(
  device: ZigbeeFactorDevice<Postfix>,
  zclNode: ZCLNode,
  { endpointId, noPowerFactorReporting, storePropertyPostfix }: ArgumentOverrides<Postfix> = {},
): Promise<void> {
  if (device.hasCapability('meter_power')) {
    device.log('Initialising meter_power capability');

    await initFactorImplementation(
      device,
      zclNode,
      'meter_power',
      zbClusters.CLUSTER.METERING,
      'meteringFactor',
      storePropertyPostfix,
      endpointId,
      noPowerFactorReporting,
    )
      .then(() => device.log('Initialised meter_power capability'))
      .catch(e => device.error('Failed to initialise meter_power capability', e));
  }

  device.log('Metering device initialised!');
}
