import {ClusterSpecification, ZigBeeDevice} from 'homey-zigbeedriver';
import {ZCLNode} from 'zigbee-clusters';

type SetName = string | ((value: any) => string);
type SetParser = (setValue: any, opts?: any) => any | null | Promise<any | null>;
const defaultSetParser: SetParser = (x) => x;

type ReportParser = (reportValue: any) => null | any | Promise<any>;
const defaultReportParser: ReportParser = (x) => x;

export interface ReadOnlyArgumentOverrides {
  capabilityId: string,
  cluster: ClusterSpecification,
  attributeName: string,
  minChange?: number,
  maxInterval?: number,
  endpointId?: number,
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

  await zclNode
    .endpoints[endpoint]
    .clusters[cluster.NAME]
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
  minChange?: number,
  maxInterval?: number,
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
        minInterval: 0,
        maxInterval: maxInterval ?? 3600,
        minChange: minChange ?? 1,
      },
    },
    reportParser,
  });

  // Configure writing the capability
  device.registerCapabilityListener(capabilityId, async (value) => {
    const attributeValue = setParser(value);
    await device.zclNode.endpoints[endpoint].clusters[cluster.NAME].writeAttributes({
      [attributeName]: attributeValue,
    });
  });

  await device.log(capabilityId, 'initialized');
}

export async function initReadCommandCapability(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId: string,
  cluster: ClusterSpecification,
  commandName: SetName,
  commandArgParser: SetParser = defaultSetParser,
  attributeName: string,
  reportParser: ReportParser  = defaultReportParser,
  minChange?: number,
  endpointId?: number,
  maxInterval?: number,
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
    set: commandName,
    setParser: commandArgParser,
    report: attributeName,
    reportOpts: {
      configureAttributeReporting: {
        minInterval: 0,
        maxInterval: maxInterval ?? 3600,
        minChange: minChange ?? 1,
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
  minChange?: number,
  maxInterval?: number,
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
        minInterval: 0,
        maxInterval: maxInterval ?? 3600,
        minChange: minChange ?? 1,
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
