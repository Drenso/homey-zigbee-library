import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability} from '../lib/attributeDevice';
import {
  ExtendedElectricalMeasurementCluster,
} from '../lib/clusters/ExtendedElectricalMeasurementCluster';
import initFactorImplementation, {
  factorReportParserBuilder,
  type InvalidFactorValueFunction,
  ZigbeeFactorDevice,
  ZigbeeFactorDeviceProperties,
} from '../lib/helper/deviceFactor';

type ArgumentOverrides = {
  endpointId?: number,
  useInstantaneousDemand?: boolean,
  useTotalActivePower?: boolean,
  noPowerFactorReporting?: boolean,
  minVoltageMeasurementChange?: number,
  minCurrentMeasurementChange?: number,
  minPowerMeasurementChange?: number,
  minFrequencyMeasurementChange?: number,
  minMeasurementInterval?: number,
  maxMeasurementInterval?: number,
  sumAverageUpdateInterval?: number,
  additionalVoltageMultiplier?: number,
  additionalCurrentMultiplier?: number,
  additionalPowerMultiplier?: number,
  additionalFrequencyMultiplier?: number,
  invalidCurrentValueFunction?: InvalidFactorValueFunction,
  invalidPowerValueFunction?: InvalidFactorValueFunction,
}

const defaultInvalidVoltageValueFunction: InvalidFactorValueFunction = value => value < 0;
const defaultInvalidCurrentValueFunction = undefined;
const defaultInvalidPowerValueFunction: InvalidFactorValueFunction = value => value == 0xFFFF;

export default async function initElectricalMeasurementDevice(
  device: ZigbeeFactorDevice,
  zclNode: ZCLNode,
  argumentOverrides: Partial<ArgumentOverrides> = {},
): Promise<void> {
  const {
    endpointId,
    noPowerFactorReporting,
    minFrequencyMeasurementChange,
    minMeasurementInterval,
    maxMeasurementInterval,
    additionalFrequencyMultiplier,
  } = argumentOverrides;

  device.log('Determining measurement type');
  const measurementType = await zclNode
    .endpoints[endpointId ?? device.getClusterEndpoint(ExtendedElectricalMeasurementCluster) ?? 1]
    ?.clusters[ExtendedElectricalMeasurementCluster.NAME]
    ?.readAttributes(['measurementType'])
    ?.catch(e => device.error('Failed to read', 'measurementType', 'from', ExtendedElectricalMeasurementCluster.NAME, e));

  device.log('Measurement type is', measurementType ?? 'not provided by device');
  const measurementFlags = measurementType?.measurementType?.getBits();
  // Configure phase A if there are no measurement types, if it is explicitly reported or if no phase is reported at all
  const hasPhaseA = !measurementFlags || measurementFlags.includes('phaseAMeasurement') || (!measurementFlags.includes('phaseAMeasurement') && !measurementFlags.includes('phaseBMeasurement') && !measurementFlags.includes('phaseCMeasurement'));

  if (device.hasCapability('measure_frequency')) {
    device.log('Initialising measure_frequency capability');

    await initFactorImplementation(
      device,
      zclNode,
      'measure_frequency',
      ExtendedElectricalMeasurementCluster,
      'acFrequencyFactor',
      endpointId,
      noPowerFactorReporting,
      {
        minMeasurementInterval,
        maxMeasurementInterval,
        minMeasurementChange: minFrequencyMeasurementChange,
      },
      undefined,
      undefined,
      additionalFrequencyMultiplier,
      value => value < 0,
    )
      .then(() => device.log('Initialised measure_frequency capability'))
      .catch(e => device.error('Failed to initialise measure_frequency capability', e));
  }

  if (hasPhaseA) {
    await initPhaseA(
      device,
      zclNode,
      argumentOverrides,
    );
  }

  if (measurementFlags && measurementFlags.includes('phaseBMeasurement')) {
    await initPhaseB(
      device,
      zclNode,
      argumentOverrides
    );
  }

  if (measurementFlags && measurementFlags.includes('phaseCMeasurement')) {
    await initPhaseC(
      device,
      zclNode,
      argumentOverrides
    );
  }

  device.log('Electrical measurement device initialized!');
}

async function initPhaseA(
  device: ZigbeeFactorDevice,
  zclNode: ZCLNode,
  {
    endpointId,
    noPowerFactorReporting,
    minMeasurementInterval,
    maxMeasurementInterval,
    minVoltageMeasurementChange,
    sumAverageUpdateInterval,
    additionalVoltageMultiplier,
    minCurrentMeasurementChange,
    additionalCurrentMultiplier,
    useInstantaneousDemand,
    useTotalActivePower,
    minPowerMeasurementChange,
    additionalPowerMultiplier,
    invalidCurrentValueFunction,
    invalidPowerValueFunction,
  }: Partial<ArgumentOverrides>
): Promise<void> {
  if (device.hasCapability('measure_voltage.phase_a')) {
    device.log('Initialising measure_voltage.phase_a capability with measure_voltage average if it exists');

    await initFactorImplementation(
      device,
      zclNode,
      'measure_voltage.phase_a',
      ExtendedElectricalMeasurementCluster,
      'acVoltageFactor',
      endpointId,
      noPowerFactorReporting,
      {
        minMeasurementInterval,
        maxMeasurementInterval,
        minMeasurementChange: minVoltageMeasurementChange,
      },
      updateAverageCapabilityFactory('measure_voltage', device),
      sumAverageUpdateInterval,
      additionalVoltageMultiplier,
      defaultInvalidVoltageValueFunction,
    )
      .then(() => device.log('Initialised measure_voltage.phase_a capability'))
      .catch(e => device.error('Failed to initialise measure_voltage.phase_a capability', e));
  } else if (device.hasCapability('measure_voltage')) {
    device.log('Initialising measure_voltage capability');

    await initFactorImplementation(
      device,
      zclNode,
      'measure_voltage',
      ExtendedElectricalMeasurementCluster,
      'acVoltageFactor',
      endpointId,
      noPowerFactorReporting,
      {
        minMeasurementInterval,
        maxMeasurementInterval,
        minMeasurementChange: minVoltageMeasurementChange,
      },
      undefined,
      undefined,
      additionalVoltageMultiplier,
      defaultInvalidVoltageValueFunction,
    )
      .then(() => device.log('Initialised measure_voltage capability'))
      .catch(e => device.error('Failed to initialise measure_voltage capability', e));
  }

  if (device.hasCapability('measure_current.phase_a')) {
    device.log('Initialising measure_current.phase_a capability with summation if it exists');

    await initFactorImplementation(
      device,
      zclNode,
      'measure_current.phase_a',
      ExtendedElectricalMeasurementCluster,
      'acCurrentFactor',
      endpointId,
      noPowerFactorReporting,
      {
        minMeasurementInterval,
        maxMeasurementInterval,
        minMeasurementChange: minCurrentMeasurementChange,
      },
      updateSummationCapabilityFactory('measure_current', device),
      sumAverageUpdateInterval,
      additionalCurrentMultiplier,
      invalidCurrentValueFunction ?? defaultInvalidCurrentValueFunction,
    )
      .then(() => device.log('Initialised measure_current.phase_a capability'))
      .catch(e => device.error('Failed to initialise measure_current.phase_a capability', e));
  } else if (device.hasCapability('measure_current')) {
    device.log('Initialising measure_current capability');

    await initFactorImplementation(
      device,
      zclNode,
      'measure_current',
      ExtendedElectricalMeasurementCluster,
      'acCurrentFactor',
      endpointId,
      noPowerFactorReporting,
      {
        minMeasurementInterval,
        maxMeasurementInterval,
        minMeasurementChange: minCurrentMeasurementChange,
      },
      undefined,
      undefined,
      additionalCurrentMultiplier,
      invalidCurrentValueFunction ?? defaultInvalidCurrentValueFunction,
    )
      .then(() => device.log('Initialised measure_current capability'))
      .catch(e => device.error('Failed to initialise measure_current capability', e));
  }

  if (useTotalActivePower && useInstantaneousDemand) {
    throw new Error('Cannot use totalActivePower and instantaneousDemand at the same time');
  }

  let measurePowerStoreProperty: keyof ZigbeeFactorDeviceProperties;

  if (useTotalActivePower) {
    measurePowerStoreProperty = 'totalActivePowerFactor';
  } else if (useInstantaneousDemand) {
    measurePowerStoreProperty = 'instantaneousDemandFactor';
  } else {
    measurePowerStoreProperty = 'activePowerFactor';
  }

  if (device.hasCapability('measure_power.phase_a')) {
    device.log('Initialising measure_power.phase_a capability with summation if it exists');

    await initFactorImplementation(
      device,
      zclNode,
      'measure_power.phase_a',
      useInstantaneousDemand ? CLUSTER.METERING : ExtendedElectricalMeasurementCluster,
      measurePowerStoreProperty,
      endpointId,
      noPowerFactorReporting,
      {
        minMeasurementInterval,
        maxMeasurementInterval,
        minMeasurementChange: minPowerMeasurementChange,
      },
      updateSummationCapabilityFactory('measure_power', device),
      sumAverageUpdateInterval,
      // Fall back to 1000 additional multiplier as the cluster definition for instantaneous demand and total active power define kW as unit of measurement
      additionalPowerMultiplier ?? ((useInstantaneousDemand || useTotalActivePower) ? 1000 : undefined),
      invalidPowerValueFunction ?? defaultInvalidPowerValueFunction,
    )
      .then(() => device.log('Initialised measure_power.phase_a capability'))
      .catch(e => device.error('Failed to initialise measure_power.phase_a capability', e));
  } else if (device.hasCapability('measure_power')) {
    device.log('Initialising measure_power capability');

    await initFactorImplementation(
      device,
      zclNode,
      'measure_power',
      useInstantaneousDemand ? CLUSTER.METERING : ExtendedElectricalMeasurementCluster,
      measurePowerStoreProperty,
      endpointId,
      noPowerFactorReporting,
      {
        minMeasurementInterval,
        maxMeasurementInterval,
        minMeasurementChange: minPowerMeasurementChange,
      },
      undefined,
      undefined,
      // Fall back to 1000 additional multiplier as the cluster definition for instantaneous demand and total active power define kW as unit of measurement
      additionalPowerMultiplier ?? ((useInstantaneousDemand || useTotalActivePower) ? 1000 : undefined),
      invalidPowerValueFunction ?? defaultInvalidPowerValueFunction,
    )
      .then(() => device.log('Initialised measure_power capability'))
      .catch(e => device.error('Failed to initialise measure_power capability', e));
  }
}

async function initPhaseB(
  device: ZigbeeFactorDevice,
  zclNode: ZCLNode,
  {
    sumAverageUpdateInterval,
    minMeasurementInterval,
    maxMeasurementInterval,
    minVoltageMeasurementChange,
    minCurrentMeasurementChange,
    minPowerMeasurementChange,
    invalidCurrentValueFunction,
    invalidPowerValueFunction,
  }: Partial<ArgumentOverrides>
): Promise<void> {
  device.log('Initialising Phase B measurements');

  if (device.hasCapability('measure_voltage.phase_b')) {
    device.log('Initialising measure_voltage.phase_b capability');

    await initReadOnlyCapability(
      device,
      zclNode,
      'measure_voltage.phase_b',
      ExtendedElectricalMeasurementCluster,
      'rmsVoltagePhB',
      factorReportParserBuilder(
        () => device['acVoltageFactor'] ?? 1,
        updateAverageCapabilityFactory('measure_voltage', device),
        sumAverageUpdateInterval,
        device,
        defaultInvalidVoltageValueFunction,
      ),
      {
        minInterval: minMeasurementInterval,
        maxInterval: maxMeasurementInterval,
        minChange: minVoltageMeasurementChange,
      },
    )
      .then(() => device.log('Initialised measure_voltage.phase_b capability'))
      .catch(e => device.error('Failed to initialise measure_voltage.phase_b capability', e));
  }

  if (device.hasCapability('measure_current.phase_b')) {
    device.log('Initialising measure_current.phase_b capability');

    await initReadOnlyCapability(
      device,
      zclNode,
      'measure_current.phase_b',
      ExtendedElectricalMeasurementCluster,
      'rmsCurrentPhB',
      factorReportParserBuilder(
        () => device['acCurrentFactor'] ?? 1,
        updateSummationCapabilityFactory('measure_current', device),
        sumAverageUpdateInterval,
        device,
        invalidCurrentValueFunction ?? defaultInvalidCurrentValueFunction,
      ),
      {
        minInterval: minMeasurementInterval,
        maxInterval: maxMeasurementInterval,
        minChange: minCurrentMeasurementChange,
      },
    )
      .then(() => device.log('Initialised measure_current.phase_b capability'))
      .catch(e => device.error('Failed to initialise measure_current.phase_b capability', e));
  }

  if (device.hasCapability('measure_power.phase_b')) {
    device.log('Initialising measure_power.phase_b capability');

    await initReadOnlyCapability(
      device,
      zclNode,
      'measure_power.phase_b',
      ExtendedElectricalMeasurementCluster,
      'activePowerPhB',
      factorReportParserBuilder(
        () => device['activePowerFactor'] ?? 1,
        updateSummationCapabilityFactory('measure_power', device),
        sumAverageUpdateInterval,
        device,
        invalidPowerValueFunction ?? defaultInvalidPowerValueFunction,
      ),
      {
        minInterval: minMeasurementInterval,
        maxInterval: maxMeasurementInterval,
        minChange: minPowerMeasurementChange,
      },
    )
      .then(() => device.log('Initialised measure_power.phase_b capability'))
      .catch(e => device.error('Failed to initialise measure_power.phase_b capability', e));
  }
}

async function initPhaseC(
  device: ZigbeeFactorDevice,
  zclNode: ZCLNode,
  {
    sumAverageUpdateInterval,
    minMeasurementInterval,
    maxMeasurementInterval,
    minVoltageMeasurementChange,
    minCurrentMeasurementChange,
    minPowerMeasurementChange,
    invalidCurrentValueFunction,
    invalidPowerValueFunction,
  }: Partial<ArgumentOverrides>
): Promise<void> {
  device.log('Initialising Phase C measurements');

  if (device.hasCapability('measure_voltage.phase_c')) {
    device.log('Initialising measure_voltage.phase_c capability');

    await initReadOnlyCapability(
      device,
      zclNode,
      'measure_voltage.phase_c',
      ExtendedElectricalMeasurementCluster,
      'rmsVoltagePhC',
      factorReportParserBuilder(
        () => device['acVoltageFactor'] ?? 1,
        updateAverageCapabilityFactory('measure_voltage', device),
        sumAverageUpdateInterval,
        device,
        defaultInvalidVoltageValueFunction,
      ),
      {
        minInterval: minMeasurementInterval,
        maxInterval: maxMeasurementInterval,
        minChange: minVoltageMeasurementChange,
      },
    )
      .then(() => device.log('Initialised measure_voltage.phase_c capability'))
      .catch(e => device.error('Failed to initialise measure_voltage.phase_c capability', e));
  }

  if (device.hasCapability('measure_current.phase_c')) {
    device.log('Initialising measure_current.phase_c capability');

    await initReadOnlyCapability(
      device,
      zclNode,
      'measure_current.phase_c',
      ExtendedElectricalMeasurementCluster,
      'rmsCurrentPhC',
      factorReportParserBuilder(
        () => device['acCurrentFactor'] ?? 1,
        updateSummationCapabilityFactory('measure_current', device),
        sumAverageUpdateInterval,
        device,
        invalidCurrentValueFunction ?? defaultInvalidCurrentValueFunction,
      ),
      {
        minInterval: minMeasurementInterval,
        maxInterval: maxMeasurementInterval,
        minChange: minCurrentMeasurementChange,
      },
    )
      .then(() => device.log('Initialised measure_current.phase_c capability'))
      .catch(e => device.error('Failed to initialise measure_current.phase_c capability', e));
  }

  if (device.hasCapability('measure_power.phase_c')) {
    device.log('Initialising measure_power.phase_c capability');

    await initReadOnlyCapability(
      device,
      zclNode,
      'measure_power.phase_c',
      ExtendedElectricalMeasurementCluster,
      'activePowerPhC',
      factorReportParserBuilder(
        () => device['activePowerFactor'] ?? 1,
        updateSummationCapabilityFactory('measure_power', device),
        sumAverageUpdateInterval,
        device,
        invalidPowerValueFunction ?? defaultInvalidPowerValueFunction,
      ),
      {
        minInterval: minMeasurementInterval,
        maxInterval: maxMeasurementInterval,
        minChange: minPowerMeasurementChange,
      },
    )
      .then(() => device.log('Initialised measure_power.phase_c capability'))
      .catch(e => device.error('Failed to initialise measure_power.phase_c capability', e));
  }
}


function updateAverageCapabilityFactory(averageCapability: string, device: ZigbeeFactorDevice): () => void {
  return (): void => {
    if (!device.hasCapability(averageCapability)) {
      return;
    }
    const capabilities = [averageCapability + '.phase_a', averageCapability + '.phase_b', averageCapability + '.phase_c'];
    const values = [];
    for (const capability of capabilities) {
      values.push(device.hasCapability(capability) ? device.getCapabilityValue(capability) : 0);
    }
    const count = values.filter(n => n > 0).length;
    device.setCapabilityValue(averageCapability,
      count !== 0
        ? values.reduce((value, sum) => value + sum, 0) / count
        : 0,
    ).catch(device.error);
  };
}

function updateSummationCapabilityFactory(summationCapability: string, device: ZigbeeFactorDevice): () => void {
  return (): void => {
    if (!device.hasCapability(summationCapability)) {
      return;
    }
    const capabilities = [summationCapability + '.phase_a', summationCapability + '.phase_b', summationCapability + '.phase_c'];
    const values = [];
    for (const capability of capabilities) {
      values.push(device.hasCapability(capability) ? device.getCapabilityValue(capability) : 0);
    }
    device.setCapabilityValue(summationCapability, values.reduce((value, sum) => value + sum, 0)).catch(device.error);
  };
}
