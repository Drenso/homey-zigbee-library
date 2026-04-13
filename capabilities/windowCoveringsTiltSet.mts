import type { ZCLNode } from 'zigbee-clusters';
import zbClusters from 'zigbee-clusters';
import { readInitialValue } from '../lib/attributeDevice.mjs';
import type { ArgumentOverrides, ZigbeeWindowCoveringsDevice } from './windowCoverings.mjs';
import { parsePercentageValue } from './windowCoverings.mjs';

const CLUSTER_SPEC = zbClusters.CLUSTER.WINDOW_COVERING;

const TILT_PERCENTAGE_ATTRIBUTE = 'currentPositionTiltPercentage';
const TILT_PERCENTAGE_CAPABILITY = 'windowcoverings_tilt_set';

export async function initTiltPercentageCapability(
  device: ZigbeeWindowCoveringsDevice,
  zclNode: ZCLNode,
  { endpointId, invertPercentage = false, invertSetting }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  if (!device.hasCapability(TILT_PERCENTAGE_CAPABILITY)) {
    return;
  }

  device.log(`Initialising ${TILT_PERCENTAGE_CAPABILITY} capability`);

  const endpoint = endpointId ?? device.getClusterEndpoint(CLUSTER_SPEC) ?? 1;

  const setParser = (value: number): { percentageTiltValue: number } => {
    if (invertSetting !== undefined && device.getSetting(invertSetting)) {
      value = 1 - value;
    }
    if (invertPercentage) {
      value = 1 - value;
    }
    return {
      percentageTiltValue: value * 100,
    };
  };

  const reportParser = (value: number): number | null => {
    device.debug(`Newly reported value for ${TILT_PERCENTAGE_CAPABILITY}`, value);
    let parsedValue = parsePercentageValue(value);
    if (parsedValue === null) {
      device.error('Tilt percentage value outside valid range');
      return null;
    }
    if (invertSetting !== undefined && device.getSetting(invertSetting)) {
      parsedValue = 1 - parsedValue;
    }
    if (invertPercentage) {
      parsedValue = 1 - parsedValue;
    }
    return parsedValue;
  };

  await readInitialValue(
    device,
    zclNode,
    TILT_PERCENTAGE_CAPABILITY,
    CLUSTER_SPEC,
    TILT_PERCENTAGE_ATTRIBUTE,
    reportParser,
    endpoint,
  );

  device.registerCapability(TILT_PERCENTAGE_CAPABILITY, CLUSTER_SPEC, {
    endpoint,
    getOpts: {
      getOnStart: false,
    },
    get: TILT_PERCENTAGE_ATTRIBUTE,
    set: 'goToTiltPercentage',
    setParser: setParser,
    report: TILT_PERCENTAGE_ATTRIBUTE,
    reportParser: reportParser,
    reportOpts: {
      configureAttributeReporting: {
        minInterval: 10,
        maxInterval: 3600,
        minChange: 1,
      },
    },
  });

  device.log(`Initialised ${TILT_PERCENTAGE_CAPABILITY} capability`);
}
