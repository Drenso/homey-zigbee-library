import {ClusterSpecification, ZigBeeDevice} from 'homey-zigbeedriver';
import {ZCLNode} from 'zigbee-clusters';

export interface ZigbeeFactorDeviceProperties {
  acVoltageFactor?: number;
  acCurrentFactor?: number;
  activePowerFactor?: number;
  meteringFactor?: number;
}

export interface ZigbeeFactorDevice extends ZigBeeDevice, ZigbeeFactorDeviceProperties {
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
  activePowerFactor: {
    value: 'activePower', multiplier: 'acPowerMultiplier', divisor: 'acPowerDivisor',
  },
  meteringFactor: {
    value: 'currentSummationDelivered', multiplier: 'multiplier', divisor: 'divisor',
  },
};

export default async function initFactorImplementation(
  device: ZigbeeFactorDevice,
  zclNode: ZCLNode,
  capability: string,
  clusterSpec: ClusterSpecification,
  storeProperty: keyof ZigbeeFactorDeviceProperties,
  endPointId?: number,
): Promise<void> {
  // Restore factor from store
  await updateDeviceFactor(device, storeProperty)
    .catch(e => device.error(`Failed to restore ${storeProperty}`, e));

  const endpoint = endPointId ?? device.getClusterEndpoint(clusterSpec) ?? 1;
  const cluster = zclNode
    .endpoints[endpoint]
    .clusters[clusterSpec.NAME];

  const reportParser = function (value: number): number | null {
    if (value < 0) {
      return null;
    }

    return value * (device[storeProperty] ?? 1);
  };

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

  // Register listener for incoming report
  cluster.on('attr.' + properties.multiplier, (value) => {
    console.log(properties.multiplier + ' attribute report received', value);
    updateDeviceFactor(device, storeProperty, value);
  });
  cluster.on('attr.' + properties.divisor, (value) => {
    console.log(properties.divisor + ' attribute report received', value);
    updateDeviceFactor(device, storeProperty, undefined, value);
  });

  // Configure the capability
  device.registerCapability(capability, clusterSpec, {
    getOpts: {
      getOnStart: false,
    },
    reportOpts: {
      configureAttributeReporting: {
        minInterval: 10,
        maxInterval: 3600,
        minChange: 1,
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
): Promise<void> {
  device.log(`Handling new ${storeProperty}`, multiplier, divisor);

  const multiplierKey = storeProperty + '_multiplier';
  const divisorKey = storeProperty + '_divisor';

  if (multiplier) {
    await device.setStoreValue(multiplierKey, multiplier)
      .catch(e => device.error('Failed to store ' + multiplierKey, e));
  } else {
    multiplier = device.getStoreValue(multiplierKey);
  }

  if (divisor) {
    await device.setStoreValue(divisorKey, divisor)
      .catch(e => device.error('Failed to store ' + divisorKey, e));
  } else {
    divisor = device.getStoreValue(divisorKey);
  }

  device[storeProperty] = (multiplier ?? 1) / (divisor ?? 1);
  device.log(`New active ${storeProperty}`, device[storeProperty]);
}
