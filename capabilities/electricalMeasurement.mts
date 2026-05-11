import zbClusters, { type ZCLNode } from 'zigbee-clusters';
import { initReadOnlyCapability } from '../lib/attributeDevice.mjs';
import { ExtendedElectricalMeasurementCluster } from '../lib/clusters/ExtendedElectricalMeasurementCluster.mjs';
import type { ZigbeeFactorDevice, ZigbeeFactorKey } from '../lib/helper/deviceFactor.mjs';
import initFactorImplementation, {
  factorReportParserBuilder,
  type InvalidFactorValueFunction,
} from '../lib/helper/deviceFactor.mjs';

type ArgumentOverrides<Postfix extends string> = {
  endpointId?: number;
  useInstantaneousDemand?: boolean;
  useTotalActivePower?: boolean;
  noPowerFactorReporting?: boolean;
  minVoltageMeasurementChange?: number;
  minCurrentMeasurementChange?: number;
  minPowerMeasurementChange?: number;
  minFrequencyMeasurementChange?: number;
  minMeasurementInterval?: number;
  maxMeasurementInterval?: number;
  sumAverageUpdateInterval?: number;
  additionalVoltageMultiplier?: number;
  additionalCurrentMultiplier?: number;
  additionalPowerMultiplier?: number;
  additionalFrequencyMultiplier?: number;
  invalidCurrentValueFunction?: InvalidFactorValueFunction;
  invalidPowerValueFunction?: InvalidFactorValueFunction;
  storePropertyPostfix?: Postfix;
  measureFrequencyCapability?: string;
  measureVoltageCapability?: string;
  measureCurrentCapability?: string;
  measurePowerCapability?: string;
  measureVoltagePhaseACapability?: string;
  measureCurrentPhaseACapability?: string;
  measurePowerPhaseACapability?: string;
  measureVoltagePhaseBCapability?: string;
  measureCurrentPhaseBCapability?: string;
  measurePowerPhaseBCapability?: string;
  measureVoltagePhaseCCapability?: string;
  measureCurrentPhaseCCapability?: string;
  measurePowerPhaseCCapability?: string;
};

const defaultInvalidVoltageValueFunction: InvalidFactorValueFunction = value => value < 0;
const defaultInvalidCurrentValueFunction = undefined;
const defaultInvalidPowerValueFunction: InvalidFactorValueFunction = value => value == 0xffff;
export default async function initElectricalMeasurementDevice<Postfix extends string = ''>(
  device: ZigbeeFactorDevice<Postfix>,
  zclNode: ZCLNode,
  argumentOverrides: ArgumentOverrides<Postfix> = {},
): Promise<void> {
  const {
    endpointId,
    noPowerFactorReporting,
    minFrequencyMeasurementChange,
    minMeasurementInterval,
    maxMeasurementInterval,
    additionalFrequencyMultiplier,
    storePropertyPostfix,
    measureFrequencyCapability = 'measure_frequency',
  } = argumentOverrides;

  device.log('Determining measurement type');
  const measurementType = await zclNode.endpoints[
    endpointId ?? device.getClusterEndpoint(ExtendedElectricalMeasurementCluster) ?? 1
  ]?.clusters[ExtendedElectricalMeasurementCluster.NAME]
    ?.readAttributes(['measurementType'])
    ?.catch(e =>
      device.error('Failed to read', 'measurementType', 'from', ExtendedElectricalMeasurementCluster.NAME, e),
    );

  device.log('Measurement type is', measurementType ?? 'not provided by device');
  // todo: remove ignore
  // @ts-expect-error getBits definition isn't correct
  const measurementFlags = measurementType?.measurementType?.getBits();
  // Configure phase A if there are no measurement types, if it is explicitly reported or if no phase is reported at all
  const hasPhaseA =
    !measurementFlags ||
    measurementFlags.includes('phaseAMeasurement') ||
    (!measurementFlags.includes('phaseAMeasurement') &&
      !measurementFlags.includes('phaseBMeasurement') &&
      !measurementFlags.includes('phaseCMeasurement'));

  if (device.hasCapability(measureFrequencyCapability)) {
    device.log(`Initialising ${measureFrequencyCapability} capability`);

    await initFactorImplementation(
      device,
      zclNode,
      measureFrequencyCapability,
      ExtendedElectricalMeasurementCluster,
      'acFrequencyFactor',
      storePropertyPostfix,
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
      .then(() => device.log(`Initialised ${measureFrequencyCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measureFrequencyCapability} capability`, e));
  }

  if (hasPhaseA) {
    await initPhaseA(device, zclNode, argumentOverrides);
  }

  if (measurementFlags && measurementFlags.includes('phaseBMeasurement')) {
    await initPhaseB(device, zclNode, argumentOverrides);
  }

  if (measurementFlags && measurementFlags.includes('phaseCMeasurement')) {
    await initPhaseC(device, zclNode, argumentOverrides);
  }

  device.log('Electrical measurement device initialized!');
}

async function initPhaseA<Postfix extends string>(
  device: ZigbeeFactorDevice<Postfix>,
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
    storePropertyPostfix,
    measureVoltageCapability = 'measure_voltage',
    measureCurrentCapability = 'measure_current',
    measurePowerCapability = 'measure_power',
    measureVoltagePhaseACapability = 'measure_voltage.phase_a',
    measureCurrentPhaseACapability = 'measure_current.phase_a',
    measurePowerPhaseACapability = 'measure_power.phase_a',
    measureVoltagePhaseBCapability = 'measure_voltage.phase_b',
    measureCurrentPhaseBCapability = 'measure_current.phase_b',
    measurePowerPhaseBCapability = 'measure_power.phase_b',
    measureVoltagePhaseCCapability = 'measure_voltage.phase_c',
    measureCurrentPhaseCCapability = 'measure_current.phase_c',
    measurePowerPhaseCCapability = 'measure_power.phase_c',
  }: ArgumentOverrides<Postfix>,
): Promise<void> {
  if (device.hasCapability(measureVoltagePhaseACapability)) {
    device.log(
      `Initialising ${measureVoltagePhaseACapability} capability with ${measureVoltageCapability} average if it exists`,
    );

    await initFactorImplementation(
      device,
      zclNode,
      measureVoltagePhaseACapability,
      ExtendedElectricalMeasurementCluster,
      'acVoltageFactor',
      storePropertyPostfix,
      endpointId,
      noPowerFactorReporting,
      {
        minMeasurementInterval,
        maxMeasurementInterval,
        minMeasurementChange: minVoltageMeasurementChange,
      },
      updateAverageCapabilityFactory(
        measureVoltageCapability,
        device,
        measureVoltagePhaseACapability,
        measureVoltagePhaseBCapability,
        measureVoltagePhaseCCapability,
      ),
      sumAverageUpdateInterval,
      additionalVoltageMultiplier,
      defaultInvalidVoltageValueFunction,
    )
      .then(() => device.log(`Initialised ${measureVoltagePhaseACapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measureVoltagePhaseACapability} capability`, e));
  } else if (device.hasCapability(measureVoltageCapability)) {
    device.log(`Initialising ${measureVoltageCapability} capability`);

    await initFactorImplementation(
      device,
      zclNode,
      measureVoltageCapability,
      ExtendedElectricalMeasurementCluster,
      'acVoltageFactor',
      storePropertyPostfix,
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
      .then(() => device.log(`Initialised ${measureVoltageCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measureVoltageCapability} capability`, e));
  }

  if (device.hasCapability(measureCurrentPhaseACapability)) {
    device.log(
      `Initialising ${measureCurrentPhaseACapability} capability with ${measureCurrentCapability} summation if it exists`,
    );

    await initFactorImplementation(
      device,
      zclNode,
      measureCurrentPhaseACapability,
      ExtendedElectricalMeasurementCluster,
      'acCurrentFactor',
      storePropertyPostfix,
      endpointId,
      noPowerFactorReporting,
      {
        minMeasurementInterval,
        maxMeasurementInterval,
        minMeasurementChange: minCurrentMeasurementChange,
      },
      updateSummationCapabilityFactory(
        measureCurrentCapability,
        device,
        measureCurrentPhaseACapability,
        measureCurrentPhaseBCapability,
        measureCurrentPhaseCCapability,
      ),
      sumAverageUpdateInterval,
      additionalCurrentMultiplier,
      invalidCurrentValueFunction ?? defaultInvalidCurrentValueFunction,
    )
      .then(() => device.log(`Initialised ${measureCurrentPhaseACapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measureCurrentPhaseACapability} capability`, e));
  } else if (device.hasCapability(measureCurrentCapability)) {
    device.log(`Initialising ${measureCurrentCapability} capability`);

    await initFactorImplementation(
      device,
      zclNode,
      measureCurrentCapability,
      ExtendedElectricalMeasurementCluster,
      'acCurrentFactor',
      storePropertyPostfix,
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
      .then(() => device.log(`Initialised ${measureCurrentCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measureCurrentCapability} capability`, e));
  }

  if (useTotalActivePower && useInstantaneousDemand) {
    throw new Error('Cannot use totalActivePower and instantaneousDemand at the same time');
  }

  let measurePowerStoreProperty: ZigbeeFactorKey;

  if (useTotalActivePower) {
    measurePowerStoreProperty = 'totalActivePowerFactor';
  } else if (useInstantaneousDemand) {
    measurePowerStoreProperty = 'instantaneousDemandFactor';
  } else {
    measurePowerStoreProperty = 'activePowerFactor';
  }

  if (device.hasCapability(measurePowerPhaseACapability)) {
    device.log(
      `Initialising ${measurePowerPhaseACapability} capability with ${measurePowerCapability} summation if it exists`,
    );

    await initFactorImplementation(
      device,
      zclNode,
      measurePowerPhaseACapability,
      useInstantaneousDemand ? zbClusters.CLUSTER.METERING : ExtendedElectricalMeasurementCluster,
      measurePowerStoreProperty,
      storePropertyPostfix,
      endpointId,
      noPowerFactorReporting,
      {
        minMeasurementInterval,
        maxMeasurementInterval,
        minMeasurementChange: minPowerMeasurementChange,
      },
      updateSummationCapabilityFactory(
        measurePowerCapability,
        device,
        measurePowerPhaseACapability,
        measurePowerPhaseBCapability,
        measurePowerPhaseCCapability,
      ),
      sumAverageUpdateInterval,
      // Fall back to 1000 additional multiplier as the cluster definition for instantaneous demand and total active power define kW as unit of measurement
      additionalPowerMultiplier ?? (useInstantaneousDemand || useTotalActivePower ? 1000 : undefined),
      invalidPowerValueFunction ?? defaultInvalidPowerValueFunction,
    )
      .then(() => device.log(`Initialised ${measurePowerPhaseACapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measurePowerPhaseACapability} capability`, e));
  } else if (device.hasCapability(measurePowerCapability)) {
    device.log(`Initialising ${measurePowerCapability} capability`);

    await initFactorImplementation(
      device,
      zclNode,
      measurePowerCapability,
      useInstantaneousDemand ? zbClusters.CLUSTER.METERING : ExtendedElectricalMeasurementCluster,
      measurePowerStoreProperty,
      storePropertyPostfix,
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
      additionalPowerMultiplier ?? (useInstantaneousDemand || useTotalActivePower ? 1000 : undefined),
      invalidPowerValueFunction ?? defaultInvalidPowerValueFunction,
    )
      .then(() => device.log(`Initialised ${measurePowerCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measurePowerCapability} capability`, e));
  }
}

async function initPhaseB<Postfix extends string>(
  device: ZigbeeFactorDevice<Postfix>,
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
    storePropertyPostfix = '' as Postfix,
    measureVoltageCapability = 'measure_voltage',
    measureCurrentCapability = 'measure_current',
    measurePowerCapability = 'measure_power',
    measureVoltagePhaseACapability = 'measure_voltage.phase_a',
    measureCurrentPhaseACapability = 'measure_current.phase_a',
    measurePowerPhaseACapability = 'measure_power.phase_a',
    measureVoltagePhaseBCapability = 'measure_voltage.phase_b',
    measureCurrentPhaseBCapability = 'measure_current.phase_b',
    measurePowerPhaseBCapability = 'measure_power.phase_b',
    measureVoltagePhaseCCapability = 'measure_voltage.phase_c',
    measureCurrentPhaseCCapability = 'measure_current.phase_c',
    measurePowerPhaseCCapability = 'measure_power.phase_c',
  }: ArgumentOverrides<Postfix>,
): Promise<void> {
  device.log('Initialising Phase B measurements');

  if (device.hasCapability(measureVoltagePhaseBCapability)) {
    device.log(
      `Initialising ${measureVoltagePhaseBCapability} capability with ${measureVoltageCapability} average if it exists`,
    );

    await initReadOnlyCapability(
      device,
      zclNode,
      measureVoltagePhaseBCapability,
      ExtendedElectricalMeasurementCluster,
      'rmsVoltagePhB',
      factorReportParserBuilder(
        () => device.zigbeeFactors[`acVoltageFactor${storePropertyPostfix}`] ?? 1,
        updateAverageCapabilityFactory(
          measureVoltageCapability,
          device,
          measureVoltagePhaseACapability,
          measureVoltagePhaseBCapability,
          measureVoltagePhaseCCapability,
        ),
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
      .then(() => device.log(`Initialised ${measureVoltagePhaseBCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measureVoltagePhaseBCapability} capability`, e));
  }

  if (device.hasCapability(measureCurrentPhaseBCapability)) {
    device.log(
      `Initialising ${measureCurrentPhaseBCapability} capability with ${measureCurrentCapability} summation if it exists`,
    );

    await initReadOnlyCapability(
      device,
      zclNode,
      measureCurrentPhaseBCapability,
      ExtendedElectricalMeasurementCluster,
      'rmsCurrentPhB',
      factorReportParserBuilder(
        () => device.zigbeeFactors[`acCurrentFactor${storePropertyPostfix}`] ?? 1,
        updateSummationCapabilityFactory(
          measureCurrentCapability,
          device,
          measureCurrentPhaseACapability,
          measureCurrentPhaseBCapability,
          measureCurrentPhaseCCapability,
        ),
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
      .then(() => device.log(`Initialised ${measureCurrentPhaseBCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measureCurrentPhaseBCapability} capability`, e));
  }

  if (device.hasCapability(measurePowerPhaseBCapability)) {
    device.log(
      `Initialising ${measurePowerPhaseBCapability} capability with ${measurePowerCapability} summation if it exists`,
    );

    await initReadOnlyCapability(
      device,
      zclNode,
      measurePowerPhaseBCapability,
      ExtendedElectricalMeasurementCluster,
      'activePowerPhB',
      factorReportParserBuilder(
        () => device.zigbeeFactors[`activePowerFactor${storePropertyPostfix}`] ?? 1,
        updateSummationCapabilityFactory(
          measurePowerCapability,
          device,
          measurePowerPhaseACapability,
          measurePowerPhaseBCapability,
          measurePowerPhaseCCapability,
        ),
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
      .then(() => device.log(`Initialised ${measurePowerPhaseBCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measureCurrentPhaseBCapability} capability`, e));
  }
}

async function initPhaseC<Postfix extends string>(
  device: ZigbeeFactorDevice<Postfix>,
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
    storePropertyPostfix = '' as Postfix,
    measureVoltageCapability = 'measure_voltage',
    measureCurrentCapability = 'measure_current',
    measurePowerCapability = 'measure_power',
    measureVoltagePhaseACapability = 'measure_voltage.phase_a',
    measureCurrentPhaseACapability = 'measure_current.phase_a',
    measurePowerPhaseACapability = 'measure_power.phase_a',
    measureVoltagePhaseBCapability = 'measure_voltage.phase_b',
    measureCurrentPhaseBCapability = 'measure_current.phase_b',
    measurePowerPhaseBCapability = 'measure_power.phase_b',
    measureVoltagePhaseCCapability = 'measure_voltage.phase_c',
    measureCurrentPhaseCCapability = 'measure_current.phase_c',
    measurePowerPhaseCCapability = 'measure_power.phase_c',
  }: ArgumentOverrides<Postfix>,
): Promise<void> {
  device.log('Initialising Phase C measurements');

  if (device.hasCapability(measureVoltagePhaseCCapability)) {
    device.log(
      `Initialising ${measureVoltagePhaseCCapability} capability with ${measureVoltageCapability} average if it exists`,
    );

    await initReadOnlyCapability(
      device,
      zclNode,
      measureVoltagePhaseCCapability,
      ExtendedElectricalMeasurementCluster,
      'rmsVoltagePhC',
      factorReportParserBuilder(
        () => device.zigbeeFactors[`acVoltageFactor${storePropertyPostfix}`] ?? 1,
        updateAverageCapabilityFactory(
          measureVoltageCapability,
          device,
          measureVoltagePhaseACapability,
          measureVoltagePhaseBCapability,
          measureVoltagePhaseCCapability,
        ),
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
      .then(() => device.log(`Initialised ${measureVoltagePhaseCCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measureVoltagePhaseCCapability} capability`, e));
  }

  if (device.hasCapability(measureCurrentPhaseCCapability)) {
    device.log(
      `Initialising ${measureCurrentPhaseCCapability} capability with ${measureCurrentCapability} summation if it exists`,
    );

    await initReadOnlyCapability(
      device,
      zclNode,
      measureCurrentPhaseCCapability,
      ExtendedElectricalMeasurementCluster,
      'rmsCurrentPhC',
      factorReportParserBuilder(
        () => device.zigbeeFactors[`acCurrentFactor${storePropertyPostfix}`] ?? 1,
        updateSummationCapabilityFactory(
          measureCurrentCapability,
          device,
          measureCurrentPhaseACapability,
          measureCurrentPhaseBCapability,
          measureCurrentPhaseCCapability,
        ),
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
      .then(() => device.log(`Initialised ${measureCurrentPhaseCCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measureCurrentPhaseCCapability} capability`, e));
  }

  if (device.hasCapability(measurePowerPhaseCCapability)) {
    device.log(
      `Initialising ${measurePowerPhaseCCapability} capability with ${measurePowerCapability} summation if it exists`,
    );

    await initReadOnlyCapability(
      device,
      zclNode,
      measurePowerPhaseCCapability,
      ExtendedElectricalMeasurementCluster,
      'activePowerPhC',
      factorReportParserBuilder(
        () => device.zigbeeFactors[`activePowerFactor${storePropertyPostfix}`] ?? 1,
        updateSummationCapabilityFactory(
          measurePowerCapability,
          device,
          measurePowerPhaseACapability,
          measurePowerPhaseBCapability,
          measurePowerPhaseCCapability,
        ),
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
      .then(() => device.log(`Initialised ${measurePowerPhaseCCapability} capability`))
      .catch(e => device.error(`Failed to initialise ${measurePowerPhaseCCapability} capability`, e));
  }
}

function updateAverageCapabilityFactory<Postfix extends string>(
  averageCapability: string,
  device: ZigbeeFactorDevice<Postfix>,
  phaseACapability: string,
  phaseBCapability: string,
  phaseCCapability: string,
): () => void {
  return (): void => {
    if (!device.hasCapability(averageCapability)) {
      return;
    }
    const capabilities = [phaseACapability, phaseBCapability, phaseCCapability];
    const values = [];
    for (const capability of capabilities) {
      values.push(device.hasCapability(capability) ? device.getCapabilityValue(capability) : 0);
    }
    const count = values.filter(n => n > 0).length;
    device
      .setCapabilityValue(averageCapability, count !== 0 ? values.reduce((value, sum) => value + sum, 0) / count : 0)
      .catch(device.error);
  };
}

function updateSummationCapabilityFactory<Postfix extends string>(
  summationCapability: string,
  device: ZigbeeFactorDevice<Postfix>,
  phaseACapability: string,
  phaseBCapability: string,
  phaseCCapability: string,
): () => void {
  return (): void => {
    if (!device.hasCapability(summationCapability)) {
      return;
    }
    const capabilities = [phaseACapability, phaseBCapability, phaseCCapability];
    const values = [];
    for (const capability of capabilities) {
      values.push(device.hasCapability(capability) ? device.getCapabilityValue(capability) : 0);
    }
    device
      .setCapabilityValue(
        summationCapability,
        values.reduce((value, sum) => value + sum, 0),
      )
      .catch(device.error);
  };
}
