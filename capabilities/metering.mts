import zbClusters, { type ZCLNode } from 'zigbee-clusters';
import type { ZigbeeFactorDevice } from '../lib/helper/deviceFactor.mjs';
import initFactorImplementation from '../lib/helper/deviceFactor.mjs';

type ArgumentOverrides<Postfix extends string> = {
  endpointId?: number;
  noPowerFactorReporting?: boolean;
  storePropertyPostfix?: Postfix;
  meterPowerCapability?: string;
};

export default async function initMeteringDevice<Postfix extends string = ''>(
  device: ZigbeeFactorDevice<Postfix>,
  zclNode: ZCLNode,
  {
    endpointId,
    noPowerFactorReporting,
    storePropertyPostfix,
    meterPowerCapability = 'meter_power',
  }: ArgumentOverrides<Postfix> = {},
): Promise<void> {
  if (device.hasCapability(meterPowerCapability)) {
    device.log(`Initialising ${meterPowerCapability} capability`);

    await initFactorImplementation(
      device,
      zclNode,
      meterPowerCapability,
      zbClusters.CLUSTER.METERING,
      'meteringFactor',
      storePropertyPostfix,
      endpointId,
      noPowerFactorReporting,
    )
      .then(() => device.log(`Initialised ${meterPowerCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${meterPowerCapability} capability`, e));
  }

  device.log('Metering device initialised!');
}
