import {ZigBeeDevice} from 'homey-zigbeedriver';
import {Cluster, CLUSTER, ZCLNode} from 'zigbee-clusters';
import mapValueRange from '../lib/helper/valueRange';
import {readInitialValue} from '../lib/attributeDevice';

const LIFT_PERCENTAGE_ATTRIBUTE = 'currentPositionLiftPercentage';
const TILT_PERCENTAGE_ATTRIBUTE = 'currentPositionTiltPercentage';

const LIFT_PERCENTAGE_CAPABILITY = 'windowcoverings_set';
const LIFT_STATE_CAPABILITY = 'windowcoverings_state';
const TILT_PERCENTAGE_CAPABILITY = 'windowcoverings_tilt_set';
const CLUSTER_SPEC = CLUSTER.WINDOW_COVERING;
const REPORT_DEBOUNCE_TIME = 1000;

const STATE_COMMAND_MAP = {
  up: 'upOpen',
  idle: 'stop',
  down: 'downClose',
} as const;

type StateCommand = keyof typeof STATE_COMMAND_MAP;

function invertStateCommand(command: StateCommand): StateCommand {
  switch (command) {
    case "up": return "down";
    case "down": return "up";
    default: return command;
  }
}

export interface WindowCoveringsProperties {
  positionUpdateDebounce?: NodeJS.Timeout | null;
  positionUpdateDebounceActive?: boolean;
}

export interface ZigbeeWindowCoveringsDevice extends ZigBeeDevice, WindowCoveringsProperties {
}

export type WindowCoveringsCluster = Cluster & {
  upOpen: () => Promise<void>;
  downClose: () => Promise<void>;
  stop: () => Promise<void>;
};

type ArgumentOverrides = {
  endpointId?: number,
  invertPercentage?: boolean,
  invertSetting?: string,
}

export default async function initWindowCoveringsDevice(
  device: ZigbeeWindowCoveringsDevice,
  zclNode: ZCLNode,
  argumentOverrides: Partial<ArgumentOverrides> = {},
): Promise<void> {
  const endpoint = argumentOverrides.endpointId ?? device.getClusterEndpoint(CLUSTER_SPEC) ?? 1;
  await initLiftPercentageCapability(device, zclNode, endpoint, argumentOverrides);
  await initLiftStateCapability(device, endpoint);
  await initTiltPercentageCapability(device, zclNode, endpoint, argumentOverrides);
}

async function initLiftPercentageCapability(
  device: ZigbeeWindowCoveringsDevice,
  zclNode: ZCLNode,
  endpoint: number,
  {
    invertPercentage = false,
    invertSetting,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  if (!device.hasCapability(LIFT_PERCENTAGE_CAPABILITY)) {
    return;
  }

  device.log(`Initialising ${LIFT_PERCENTAGE_CAPABILITY} capability`);

  const cluster = zclNode
    .endpoints[endpoint]
    .clusters[CLUSTER_SPEC.NAME] as unknown as WindowCoveringsCluster;

  const setParser = (value: number): Promise<null | { percentageLiftValue: number }> => LiftPercentageCapabilitySetParser(device, cluster, invertPercentage, invertSetting, value);
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

async function initLiftStateCapability(
  device: ZigbeeWindowCoveringsDevice,
  endpoint: number,
  {
    invertSetting,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  if (!device.hasCapability(LIFT_PERCENTAGE_CAPABILITY)) {
    return;
  }

  device.log(`Initialising ${LIFT_STATE_CAPABILITY} capability`);

  const set = (value: StateCommand): typeof STATE_COMMAND_MAP[StateCommand] => {
    if (invertSetting !== undefined && device.getSetting(invertSetting)) {
      value = invertStateCommand(value);
    }
    return STATE_COMMAND_MAP[value];
  };

  device.registerCapability(LIFT_STATE_CAPABILITY, CLUSTER_SPEC, {
    endpoint,
    set: set,
    setParser: () => ({}),
  });

  device.log(`Initialised ${LIFT_STATE_CAPABILITY} capability`);
}

async function initTiltPercentageCapability(
  device: ZigbeeWindowCoveringsDevice,
  zclNode: ZCLNode,
  endpoint: number,
  {
    invertPercentage = false,
    invertSetting,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  if (!device.hasCapability(TILT_PERCENTAGE_CAPABILITY)) {
    return;
  }

  device.log(`Initialising ${TILT_PERCENTAGE_CAPABILITY} capability`);

  const setParser = (value: number): { percentageTiltValue: number } => {
    if (invertSetting !== undefined && device.getSetting(invertSetting)) {
      value = 1 - value;
    }
    if (invertPercentage) {
      value = 1 - value;
    }
    return ({
      percentageTiltValue: value * 100,
    });
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

  await readInitialValue(device, zclNode, TILT_PERCENTAGE_CAPABILITY, CLUSTER_SPEC, TILT_PERCENTAGE_ATTRIBUTE, reportParser, endpoint);

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

async function LiftPercentageCapabilitySetParser(
  device: ZigbeeWindowCoveringsDevice,
  cluster: WindowCoveringsCluster,
  invertPercentage: boolean,
  invertSetting: string | undefined,
  value: number,
): Promise<null | { percentageLiftValue: number }> {
  if (invertSetting !== undefined && device.getSetting(invertSetting)) {
    value = 1 - value;
  }

  setPositionUpdateDebounce(device);

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
  value: number
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

function setPositionUpdateDebounce(device: ZigbeeWindowCoveringsDevice): void {
  if (device.positionUpdateDebounce) {
    device.positionUpdateDebounce.refresh();
  } else {
    device.positionUpdateDebounce = device.homey.setTimeout(() => {
      device.positionUpdateDebounceActive = false;
      device.positionUpdateDebounce = null;
    }, REPORT_DEBOUNCE_TIME);
  }

  device.positionUpdateDebounceActive = true;
}

function parsePercentageValue(value: number): number | null {
  if (value < 0x00 || value > 0x64) return null;
  return mapValueRange(0, 100, 0, 1, value);
}
