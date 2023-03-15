import {ZigBeeDevice} from 'homey-zigbeedriver';
import {
  IASZoneCluster,
  ZCLNode,
  ZoneEnrollRequestParams, ZoneStatus, ZoneStatusChangedPayload,
} from 'zigbee-clusters';

export default async function initIasZoneDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityIds: string[],
  statusParsers: (((payload: ZoneStatusChangedPayload) => any) | ZoneStatus)[],
  endpointId?: number,
): Promise<void> {

  if (statusParsers.length !== capabilityIds.length) {
    throw new Error('Amount of capabilities and flag names should match!');
  }

  const endpoint = endpointId ?? device.getClusterEndpoint(IASZoneCluster) ?? 1;

  device.log(`Initialising IasZone on endpoint ${endpoint}`);

  const cluster = zclNode.endpoints[endpoint]
    .clusters[IASZoneCluster.NAME] as unknown as IASZoneCluster;

  // Register enroll request listener for automatic enrollment
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Dynamic event handler
  cluster.onZoneEnrollRequest = (payload: ZoneEnrollRequestParams): void => {
    device.log('Zone enroll request received', payload);
    cluster
      .zoneEnrollResponse({
        enrollResponseCode: 'success',
        zoneId: Math.floor(Math.random() * 255),
      }, {waitForResponse: false})
      .catch(e => device.error('Failed to write response', e));
  };

  // Register zone state change notification
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Dynamic event handler
  cluster.onZoneStatusChangeNotification = async (payload: ZoneStatusChangedPayload): void => {
    const flags = payload.zoneStatus.getBits();
    // device.log('Zone status change notification received', payload);

    for (let i = 0; i < capabilityIds.length; i++) {
      const capabilityId = capabilityIds[i];
      const statusParser = statusParsers[i];
      if (typeof statusParser == 'string') {
        await device.setCapabilityValue(capabilityId, flags.includes(statusParser));
      } else {
        await device.setCapabilityValue(capabilityId, await statusParser(payload));
      }
    }

  };

  device.log(`Initialised IasZone on endpoint ${endpoint}, waiting for zone enroll request`);
}
