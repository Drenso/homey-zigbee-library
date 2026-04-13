import { ZigBeeDevice } from 'homey-zigbeedriver';
import zbClusters, { type ZCLNode } from 'zigbee-clusters';

export default async function retrieveDeviceInfo(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  endpointId?: number,
): Promise<void> {
  const endpoint = endpointId ?? device.getClusterEndpoint(zbClusters.CLUSTER.BASIC) ?? 1;
  // Retrieve the values
  const clusterInstance = zclNode.endpoints[endpoint].clusters[zbClusters.CLUSTER.BASIC.NAME];
  if (!clusterInstance) {
    throw new Error(`Cluster ${zbClusters.CLUSTER.BASIC.NAME} not found on endpoint ${endpoint}`);
  }

  await clusterInstance
    .readAttributes(['hwVersion', 'dateCode', 'swBuildId'])
    .then(async result => {
      // Convert incoming values to string
      const values: Record<string, string> = {};
      Object.keys(result).forEach(key => (values[key] = String(result[key as keyof typeof result])));
      device.log('Retrieved device information', result, values);

      await device.setSettings(values).catch(e => device.error('Failed to set device info settings', e));
    })
    .catch(e => device.error('Failed to read device info attributes', e));
}
