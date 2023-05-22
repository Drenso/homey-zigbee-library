import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';

export default async function retrieveDeviceInfo(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  endpointId?: number,
): Promise<void> {
  const endpoint = endpointId ?? device.getClusterEndpoint(CLUSTER.BASIC) ?? 1;
  // Retrieve the values
  await zclNode
    .endpoints[endpoint]
    .clusters[CLUSTER.BASIC.NAME]
    .readAttributes(['hwVersion', 'dateCode', 'swBuildId'])
    .then(async (result) => {
      // Convert incoming values to string
      const values: Record<string, string> = {};
      Object.keys(result).forEach((key) => values[key] = String(result[key]));
      device.log('Retrieved device information', result, values);

      await device.setSettings(values)
        .catch(e => device.error('Failed to set device info settings', e));
    })
    .catch(e => device.error('Failed to read device info attributes', e));
}
