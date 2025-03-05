import {CLUSTER, ZCLNode} from "zigbee-clusters";
import {readInitialValue} from "../lib/attributeDevice";
import mapValueRange from "../lib/helper/valueRange";
import {
  ArgumentOverrides,
  parsePercentageValue, STATE_COMMAND_MAP,
  WindowCoveringsCluster,
  ZigbeeWindowCoveringsDevice,
} from "./windowCoverings";

const CLUSTER_SPEC = CLUSTER.WINDOW_COVERING;
const DEFAULT_REPORT_DEBOUNCE_TIME = 5000;

const LIFT_PERCENTAGE_ATTRIBUTE = 'currentPositionLiftPercentage';
const LIFT_PERCENTAGE_CAPABILITY = 'windowcoverings_set';

export async function initLiftPercentageCapability(
  device: ZigbeeWindowCoveringsDevice,
  zclNode: ZCLNode,
  {
    endpointId,
    invertPercentage = false,
    invertSetting,
    positionUpdatesAfterSetDebounceTime: debounceTime,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  if (!device.hasCapability(LIFT_PERCENTAGE_CAPABILITY)) {
    return;
  }

  device.log(`Initialising ${LIFT_PERCENTAGE_CAPABILITY} capability`);

  const endpoint = endpointId ?? device.getClusterEndpoint(CLUSTER_SPEC) ?? 1;
  const cluster = zclNode
    .endpoints[endpoint]
    .clusters[CLUSTER_SPEC.NAME] as unknown as WindowCoveringsCluster;

  const setParser = (value: number): Promise<null | {
    percentageLiftValue: number
  }> => LiftPercentageCapabilitySetParser(device, cluster, invertPercentage, invertSetting, debounceTime, value);
  const reportParser = (value: number): number | null => LiftPercentageCapabilityReportParser(device, invertPercentage, invertSetting, value);

  await readInitialValue(device, zclNode, LIFT_PERCENTAGE_CAPABILITY, CLUSTER_SPEC, LIFT_PERCENTAGE_ATTRIBUTE, reportParser, endpoint);

  device.registerCapability(LIFT_PERCENTAGE_CAPABILITY, CLUSTER_SPEC, {
    endpoint,
    getOpts: {
      getOnStart: false,
    },
    get: LIFT_PERCENTAGE_ATTRIBUTE,
    set: 'goToLiftPercentage',
    setParser: setParser,
    report: LIFT_PERCENTAGE_ATTRIBUTE,
    reportParser: reportParser,
    reportOpts: {
      configureAttributeReporting: {
        minInterval: 10,
        maxInterval: 3600,
        minChange: 1,
      },
    },
  });

  device.log(`Initialised ${LIFT_PERCENTAGE_CAPABILITY} capability`);
}

async function LiftPercentageCapabilitySetParser(
  device: ZigbeeWindowCoveringsDevice,
  cluster: WindowCoveringsCluster,
  invertPercentage: boolean,
  invertSetting: string | undefined,
  debounceTime: number | undefined,
  value: number,
): Promise<null | { percentageLiftValue: number }> {
  if (invertSetting !== undefined && device.getSetting(invertSetting)) {
    value = 1 - value;
  }

  setPositionUpdateDebounce(device, debounceTime);

  device.debug(`Newly set value for ${LIFT_PERCENTAGE_CAPABILITY}`, invertPercentage ? 1 - value : value);

  // Override goToLiftPercentage to enforce blind to open/close completely
  if (value === 0 || value === 1) {
    const windowCoveringCommand = value === 1 ? STATE_COMMAND_MAP.up : STATE_COMMAND_MAP.down;
    device.debug(`set → \`${LIFT_PERCENTAGE_CAPABILITY}\`: ${value} → setParser → ${windowCoveringCommand}`);

    await cluster[windowCoveringCommand]();

    await device.setCapabilityValue(LIFT_PERCENTAGE_CAPABILITY, invertPercentage ? 1 - value : value);

    return null;
  }

  if (invertPercentage) {
    value = 1 - value;
  }

  const mappedValue = Math.round(mapValueRange(0, 1, 0, 100, value));
  device.debug(`set → \`${LIFT_PERCENTAGE_CAPABILITY}\`: ${value} → setParser → goToLiftPercentage`, mappedValue);

  return {
    percentageLiftValue: mappedValue,
  };
}

function LiftPercentageCapabilityReportParser(
  device: ZigbeeWindowCoveringsDevice,
  invertPercentage: boolean,
  invertSetting: string | undefined,
  value: number,
): number | null {
  device.debug(`Newly reported value for ${LIFT_PERCENTAGE_CAPABILITY}`, value);

  device.positionUpdateDebounce?.refresh();
  if (device.positionUpdateDebounceActive) {
    return null;
  }

  let parsedValue = parsePercentageValue(value);
  if (parsedValue === null) {
    device.error('Lift percentage value outside valid range');
    return null;
  }


  if (invertSetting !== undefined && device.getSetting(invertSetting)) {
    parsedValue = 1 - parsedValue;
  }

  if (invertPercentage) {
    parsedValue = 1 - parsedValue;
  }

  return parsedValue;
}

function setPositionUpdateDebounce(device: ZigbeeWindowCoveringsDevice, time: number = DEFAULT_REPORT_DEBOUNCE_TIME): void {
  if (time === 0) {
    return;
  }

  if (device.positionUpdateDebounce) {
    device.positionUpdateDebounce.refresh();
  } else {
    device.positionUpdateDebounce = device.homey.setTimeout(() => {
      device.positionUpdateDebounceActive = false;
      device.positionUpdateDebounce = null;
    }, time);
  }

  device.positionUpdateDebounceActive = true;
}
