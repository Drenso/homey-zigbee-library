import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import initFactorImplementation, {
  factorReportParserBuilder,
  ZigbeeFactorDevice,
} from '../lib/helper/deviceFactor';
import {
  ExtendedElectricalMeasurementCluster,
} from '../lib/clusters/ExtendedElectricalMeasurementCluster';
import {initReadOnlyCapability} from '../lib/attributeDevice';

type ArgumentOverrides = {
  endpointId?: number,
  useInstantaneousDemand?: boolean,
  noPowerFactorReporting?: boolean,
  minVoltageMeasurementChange?: number,
  minCurrentMeasurementChange?: number,
  minPowerMeasurementChange?: number,
  minMeasurementInterval?: number,
  maxMeasurementInterval?: number,
  sumAverageUpdateInterval?: number,
  additionalVoltageMultiplier?: number,
  additionalCurrentMultiplier?: number,
  additionalPowerMultiplier?: number,
}

export default async function initElectricalMeasurementDevice(
  device: ZigbeeFactorDevice,
  zclNode: ZCLNode,
  {
    endpointId,
    useInstantaneousDemand,
    noPowerFactorReporting,
    minVoltageMeasurementChange,
    minCurrentMeasurementChange,
    minPowerMeasurementChange,
    minMeasurementInterval,
    maxMeasurementInterval,
    sumAverageUpdateInterval,
    additionalVoltageMultiplier,
    additionalCurrentMultiplier,
    additionalPowerMultiplier,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
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

  const updateAverageCapabilityFactory = (averageCapability: string): () => void => {
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
  };

  const updateSummationCapabilityFactory = (summationCapability: string): () => void => {
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
  };

  if (hasPhaseA) {
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
        updateAverageCapabilityFactory('measure_voltage'),
        sumAverageUpdateInterval,
        additionalVoltageMultiplier,
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
        updateSummationCapabilityFactory('measure_current'),
        sumAverageUpdateInterval,
        additionalCurrentMultiplier,
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
      )
        .then(() => device.log('Initialised measure_current capability'))
        .catch(e => device.error('Failed to initialise measure_current capability', e));
    }

    if (device.hasCapability('measure_power.phase_a')) {
      device.log('Initialising measure_power.phase_a capability with summation if it exists');

      await initFactorImplementation(
        device,
        zclNode,
        'measure_power.phase_a',
        useInstantaneousDemand ? CLUSTER.METERING : ExtendedElectricalMeasurementCluster,
        useInstantaneousDemand ? 'instantaneousDemandFactor' : 'activePowerFactor',
        endpointId,
        noPowerFactorReporting,
        {
          minMeasurementInterval,
          maxMeasurementInterval,
          minMeasurementChange: minPowerMeasurementChange,
        },
        updateSummationCapabilityFactory('measure_power'),
        sumAverageUpdateInterval,
        // Fall back to 1000 additional multiplier as the cluster definition for instantaneous demand defines kW as unit of measurement
        additionalPowerMultiplier ?? (useInstantaneousDemand ? 1000 : undefined),
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
        useInstantaneousDemand ? 'instantaneousDemandFactor' : 'activePowerFactor',
        endpointId,
        noPowerFactorReporting,
        {
          minMeasurementInterval,
          maxMeasurementInterval,
          minMeasurementChange: minPowerMeasurementChange,
        },
        undefined,
        undefined,
        // Fall back to 1000 additional multiplier as the cluster definition for instantaneous demand defines kW as unit of measurement
        additionalPowerMultiplier ?? (useInstantaneousDemand ? 1000 : undefined),
      )
        .then(() => device.log('Initialised measure_power capability'))
        .catch(e => device.error('Failed to initialise measure_power capability', e));
    }
  }

  if (measurementFlags && measurementFlags.includes('phaseBMeasurement')) {
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
          updateAverageCapabilityFactory('measure_voltage'),
          sumAverageUpdateInterval,
          device,
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
          updateSummationCapabilityFactory('measure_current'),
          sumAverageUpdateInterval,
          device,
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
          updateSummationCapabilityFactory('measure_power'),
          sumAverageUpdateInterval,
          device,
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

  if (measurementFlags && measurementFlags.includes('phaseCMeasurement')) {
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
          updateAverageCapabilityFactory('measure_voltage'),
          sumAverageUpdateInterval,
          device,
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
      device.log('Initialising measure_current.phase_b capability');

      await initReadOnlyCapability(
        device,
        zclNode,
        'measure_current.phase_c',
        ExtendedElectricalMeasurementCluster,
        'rmsCurrentPhC',
        factorReportParserBuilder(
          () => device['acCurrentFactor'] ?? 1,
          updateSummationCapabilityFactory('measure_current'),
          sumAverageUpdateInterval,
          device,
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
          updateSummationCapabilityFactory('measure_power'),
          sumAverageUpdateInterval,
          device,
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

  device.log('Electrical measurement device initialized!');
}
