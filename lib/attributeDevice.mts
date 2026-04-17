import type { ClusterSpecification, ZigBeeDevice } from 'homey-zigbeedriver';
import type { ZCLNode } from 'zigbee-clusters';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetName = string | ((value: any) => string);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetParser = (setValue: any, opts?: any) => any | null | Promise<any | null>;
const defaultSetParser: SetParser = x => x;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReportParser = (reportValue: any) => null | any | Promise<any>;
const defaultReportParser: ReportParser = x => x;

export interface DefaultConfiguration {
  capabilityId: string;
  endpointId?: number;
}

export interface ReportingConfiguration {
  minChange?: number;
  minInterval?: number;
  maxInterval?: number;
}

export interface AttributeConfiguration extends DefaultConfiguration, ReportingConfiguration {
  cluster: ClusterSpecification;
  attributeName: string;
}

export async function readInitialValue(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId: string,
  cluster: ClusterSpecification,
  attributeName: string,
  reportParser: ReportParser,
  endpointId?: number,
): Promise<void> {
  const endpoint = endpointId ?? device.getClusterEndpoint(cluster) ?? 1;

  const clusterInstance = zclNode.endpoints[endpoint].clusters[cluster.NAME];
  if (!clusterInstance) {
    throw new Error(`Cluster ${cluster.NAME} not found on endpoint ${endpoint}`);
  }

  clusterInstance
    .readAttributes([attributeName])
    .then(async result => {
      await device
        .setCapabilityValue(capabilityId, await reportParser(result[attributeName]))
        .catch(e => device.error('Failed to set', capabilityId, 'capability', e));
    })
    .catch(e => device.error('Failed to read', attributeName, 'from', cluster.NAME, e));
}

export async function initReadWriteCapability(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId: string,
  cluster: ClusterSpecification,
  attributeName: string,
  reportParser: ReportParser = defaultReportParser,
  setParser: SetParser = defaultSetParser,
  { minInterval = 0, maxInterval = 3600, minChange = 1 }: ReportingConfiguration = {},
  endpointId?: number,
): Promise<void> {
  const endpoint = endpointId ?? device.getClusterEndpoint(cluster) ?? 1;

  // Retrieve initial value
  await readInitialValue(device, zclNode, capabilityId, cluster, attributeName, reportParser, endpoint);

  // Configure reading the capability
  device.registerCapability(capabilityId, cluster, {
    endpoint,
    get: attributeName,
    getOpts: {
      getOnStart: false,
    },
    report: attributeName,
    reportOpts: {
      configureAttributeReporting: {
        minInterval,
        maxInterval,
        minChange,
      },
    },
    reportParser,
    set: 'writeAttributes',
    setParser: value => {
      return { [attributeName]: setParser(value) };
    },
  });

  device.log(capabilityId, 'initialized');
}

export async function initReadCommandCapability(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId: string,
  cluster: ClusterSpecification,
  commandName: SetName,
  commandArgParser: SetParser = defaultSetParser,
  attributeName: string,
  reportParser: ReportParser = defaultReportParser,
  { minInterval = 0, maxInterval = 3600, minChange = 1 }: ReportingConfiguration = {},
  endpointId?: number,
  pollInterval?: number,
): Promise<void> {
  const endpoint = endpointId ?? device.getClusterEndpoint(cluster) ?? 1;

  // Retrieve initial value
  await readInitialValue(device, zclNode, capabilityId, cluster, attributeName, reportParser, endpoint);

  // Configure the capability
  device.registerCapability(capabilityId, cluster, {
    endpoint,
    get: attributeName,
    getOpts: {
      getOnStart: false,
      pollInterval,
    },
    set: commandName,
    setParser: commandArgParser,
    report: attributeName,
    reportOpts: {
      configureAttributeReporting: {
        minInterval,
        maxInterval,
        minChange,
      },
    },
    reportParser,
  });

  device.log(capabilityId, 'initialized');
}

export async function initReadOnlyCapability(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId: string,
  cluster: ClusterSpecification,
  attributeName: string,
  reportParser: ReportParser = defaultReportParser,
  { minInterval = 0, maxInterval = 3600, minChange = 1 }: ReportingConfiguration = {},
  endpointId?: number,
): Promise<void> {
  const endpoint = endpointId ?? device.getClusterEndpoint(cluster) ?? 1;

  // Retrieve initial value
  await readInitialValue(device, zclNode, capabilityId, cluster, attributeName, reportParser, endpoint);

  // Configure the capability
  device.registerCapability(capabilityId, cluster, {
    endpoint,
    get: attributeName,
    getOpts: {
      getOnStart: false,
    },
    report: attributeName,
    reportOpts: {
      configureAttributeReporting: {
        minInterval,
        maxInterval,
        minChange,
      },
    },
    reportParser,
  });

  device.log(capabilityId, 'initialized');
}

export async function initWriteOnlyCapability(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId: string,
  cluster: ClusterSpecification,
  setName: SetName,
  setParser: SetParser = defaultSetParser,
  endpointId?: number,
): Promise<void> {
  const endpoint = endpointId ?? device.getClusterEndpoint(cluster) ?? 1;

  // Configure the capability
  device.registerCapability(capabilityId, cluster, {
    endpoint,
    set: setName,
    setParser,
  });

  device.log(capabilityId, 'initialized');
}
