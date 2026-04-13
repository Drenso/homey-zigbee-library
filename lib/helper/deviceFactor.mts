import {ClusterSpecification, ZigBeeDevice} from 'homey-zigbeedriver';
import {ZCLNode} from 'zigbee-clusters';

export interface ZigbeeFactorDeviceProperties {
  acVoltageFactor?: number;
  acCurrentFactor?: number;
  acFrequencyFactor?: number;
  activePowerFactor?: number;
  instantaneousDemandFactor?: number;
  meteringFactor?: number;
  totalActivePowerFactor?: number;
}

export interface ZigbeeFactorDevice extends ZigBeeDevice, ZigbeeFactorDeviceProperties {
}

export interface MeasurementReportingInterface {
  minMeasurementChange?: number,
  minMeasurementInterval?: number,
  maxMeasurementInterval?: number,
}

const factorProperties: Record<keyof ZigbeeFactorDeviceProperties, {
  value: string,
  multiplier: string,
  divisor: string,
}> = {
  acVoltageFactor: {
    value: 'rmsVoltage', multiplier: 'acVoltageMultiplier', divisor: 'acVoltageDivisor',
  },
  acCurrentFactor: {
    value: 'rmsCurrent', multiplier: 'acCurrentMultiplier', divisor: 'acCurrentDivisor',
  },
  acFrequencyFactor: {
    value: 'acFrequency', multiplier: 'acFrequencyMultiplier', divisor: 'acFrequencyDivisor',
  },
  activePowerFactor: {
    value: 'activePower', multiplier: 'acPowerMultiplier', divisor: 'acPowerDivisor',
  },
  instantaneousDemandFactor: {
    value: 'instantaneousDemand', multiplier: 'multiplier', divisor: 'divisor',
  },
  meteringFactor: {
    value: 'currentSummationDelivered', multiplier: 'multiplier', divisor: 'divisor',
  },
  totalActivePowerFactor: {
    value: 'totalActivePower', multiplier: 'powerMultiplier', divisor: 'powerDivisor',
  },
};

export type InvalidFactorValueFunction = (value: number) => boolean;

export function factorReportParserBuilder(
  factor: () => number,
  onReport?: () => void,
  onReportTimeout?: number,
  device?: ZigbeeFactorDevice,
  invalidValue?: InvalidFactorValueFunction,
): (value: number) => (number | null) {
  return function (value: number): number | null {
    if (invalidValue && invalidValue(value)) {
      return null;
    }

    const factorValue = value * factor();
    if (onReport) {
      if (device) {
        device.homey.setTimeout(onReport, (onReportTimeout ?? 1) * 1000);
      } else {
        onReport();
      }
    }
    return factorValue;
  };
}

export default async function initFactorImplementation(
  device: ZigbeeFactorDevice,
  zclNode: ZCLNode,
  capability: string,
  clusterSpec: ClusterSpecification,
  storeProperty: keyof ZigbeeFactorDeviceProperties,
  endPointId?: number,
  noPowerFactorReporting?: boolean,
  {
    minMeasurementInterval = 10,
    maxMeasurementInterval = 3600,
    minMeasurementChange = 1,
  }: MeasurementReportingInterface = {},
  onReport?: () => void,
  onReportTimeout = 1,
  additionalMultiplier?: number,
  invalidFactorValue?: InvalidFactorValueFunction,
): Promise<void> {
  // Restore factor from store
  await updateDeviceFactor(device, storeProperty, undefined, undefined, additionalMultiplier)
    .catch(e => device.error(`Failed to restore ${storeProperty}`, e));

  const endpoint = endPointId ?? device.getClusterEndpoint(clusterSpec) ?? 1;
  const cluster = zclNode
    .endpoints[endpoint]
    .clusters[clusterSpec.NAME];

  const reportParser = factorReportParserBuilder(
    () => device[storeProperty] ?? 1,
    onReport,
    onReportTimeout,
    device,
    invalidFactorValue
  );

  const properties = factorProperties[storeProperty];

  // Retrieve initial values
  await cluster
    .readAttributes([properties.value, properties.multiplier, properties.divisor])
    .then(async (result) => {
      await updateDeviceFactor(device, storeProperty, result[properties.multiplier], result[properties.divisor]);
      await device
        .setCapabilityValue(capability, reportParser(result[properties.value]))
        .catch(e => device.error(`Failed to set ${capability} capability value`, e));
    })
    .catch(e => device.error(`Failed to read ${clusterSpec.NAME} ${Object.values(properties)} attributes`, e));

  // Configure reporting for the power factor
  if (noPowerFactorReporting !== true) {
    await device
      .configureAttributeReporting([
        {
          endpointId: endpoint,
          cluster: clusterSpec,
          attributeName: properties.multiplier,
          minInterval: 0,
          maxInterval: 3600,
          minChange: 1,
        }, {
          endpointId: endpoint,
          cluster: clusterSpec,
          attributeName: properties.divisor,
          minInterval: 0,
          maxInterval: 3600,
          minChange: 1,
        },
      ])
      .catch(e => device.error(`Failed to configure ${clusterSpec.NAME} [${properties.multiplier}, ${properties.divisor}] attribute reporting`, e));
  }

  // Register listener for incoming report
  cluster.on('attr.' + properties.multiplier, (value) => {
    device.log(properties.multiplier + ' attribute report received', value);
    updateDeviceFactor(device, storeProperty, value);
  });
  cluster.on('attr.' + properties.divisor, (value) => {
    device.log(properties.divisor + ' attribute report received', value);
    updateDeviceFactor(device, storeProperty, undefined, value);
  });

  // Configure the capability
  device.registerCapability(capability, clusterSpec, {
    endpoint,
    get: properties.value,
    report: properties.value,
    getOpts: {
      getOnStart: false,
    },
    reportOpts: {
      configureAttributeReporting: {
        minInterval: minMeasurementInterval,
        maxInterval: maxMeasurementInterval,
        minChange: minMeasurementChange,
      },
    },
    reportParser,
  });
}

async function updateDeviceFactor(
  device: ZigbeeFactorDevice,
  storeProperty: keyof ZigbeeFactorDeviceProperties,
  multiplier?: number,
  divisor?: number,
  additionalMultiplier?: number,
): Promise<void> {
  device.log(`Handling new ${storeProperty}`, multiplier, divisor);

  const multiplierKey = storeProperty + '_multiplier';
  const divisorKey = storeProperty + '_divisor';
  const additionalMultiplierKey = storeProperty + '_additional_multiplier';

  if (multiplier) {
    await device.setStoreValue(multiplierKey, multiplier)
      .catch(e => device.error(`Failed to store ${multiplierKey}`, e));
  } else {
    multiplier = device.getStoreValue(multiplierKey);
  }

  if (divisor) {
    await device.setStoreValue(divisorKey, divisor)
      .catch(e => device.error(`Failed to store ${divisorKey}`, e));
  } else {
    divisor = device.getStoreValue(divisorKey);
  }

  if (additionalMultiplier) {
    await device.setStoreValue(additionalMultiplierKey, additionalMultiplier)
      .catch(e => device.error(`Failed to store ${additionalMultiplierKey}`, e));
  } else {
    additionalMultiplier = device.getStoreValue(additionalMultiplierKey);
  }

  device[storeProperty] = ((multiplier ?? 1) / (divisor ?? 1)) * (additionalMultiplier ?? 1);
  device.log(`New active ${storeProperty}`, device[storeProperty]);
}
