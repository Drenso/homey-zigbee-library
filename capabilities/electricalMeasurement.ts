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
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  device.log('Determining measurement type');
  const measurementType = await zclNode
    .endpoints[endpointId ?? device.getClusterEndpoint(ExtendedElectricalMeasurementCluster) ?? 1]
    .clusters[ExtendedElectricalMeasurementCluster.NAME]
    .readAttributes(['measurementType'])
    .catch(e => device.error('Failed to read', 'measurementType', 'from', ExtendedElectricalMeasurementCluster.NAME, e));

  device.log('Measurement type is', measurementType);
  const measurementFlags = measurementType?.measurementType?.getBits();
  // Configure phase A if there are no measurement types, if it is explicitly reported or if no phase is reported at all
  const hasPhaseA = !measurementFlags || measurementFlags.includes('phaseAMeasurement') || (!measurementFlags.includes('phaseAMeasurement') && !measurementFlags.includes('phaseBMeasurement') && !measurementFlags.includes('phaseCMeasurement'));

  if (hasPhaseA) {
    if (device.hasCapability('measure_voltage')) {
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
      )
        .then(() => device.log('Initialised measure_voltage capability'))
        .catch(e => device.error('Failed to initialise measure_voltage capability', e));
    }

    if (device.hasCapability('measure_current')) {
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
      )
        .then(() => device.log('Initialised measure_current capability'))
        .catch(e => device.error('Failed to initialise measure_current capability', e));
    }

    if (device.hasCapability('measure_power')) {
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
        factorReportParserBuilder(() => device['acVoltageFactor'] ?? 1),
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
        factorReportParserBuilder(() => device['acCurrentFactor'] ?? 1),
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
        factorReportParserBuilder(() => device['activePowerFactor'] ?? 1),
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
        factorReportParserBuilder(() => device['acVoltageFactor'] ?? 1),
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
        factorReportParserBuilder(() => device['acCurrentFactor'] ?? 1),
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
        factorReportParserBuilder(() => device['activePowerFactor'] ?? 1),
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
