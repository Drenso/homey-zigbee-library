import type { ZigBeeDevice } from 'homey-zigbeedriver';
import type { ZCLNode, ZoneEnrollRequestParams, ZoneStatus, ZoneStatusChangedPayload } from 'zigbee-clusters';
import { IASZoneCluster } from 'zigbee-clusters';

export default async function initIasZoneDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityIds: string[],
  statusParsers: (((payload: ZoneStatusChangedPayload) => any) | ZoneStatus)[], // eslint-disable-line @typescript-eslint/no-explicit-any
  endpointId?: number,
  autoEnrollResponse?: boolean,
): Promise<void> {
  if (statusParsers.length !== capabilityIds.length) {
    throw new Error('Amount of capabilities and flag names should match!');
  }

  const endpoint = endpointId ?? device.getClusterEndpoint(IASZoneCluster) ?? 1;

  device.log(`Initialising IasZone on endpoint ${endpoint}`);

  const cluster = zclNode.endpoints[endpoint].clusters[IASZoneCluster.NAME] as unknown as IASZoneCluster;

  const zoneId = Math.floor(Math.random() * 255);
  const sendZoneEnrollResponse = (): void => {
    cluster
      .zoneEnrollResponse(
        {
          enrollResponseCode: 'success',
          zoneId: zoneId,
        },
        { waitForResponse: false },
      )
      .catch(e => device.error('Failed to write response', e));
  };

  // Register enroll request listener for automatic enrollment
  cluster.onZoneEnrollRequest = (payload: ZoneEnrollRequestParams): void => {
    device.log('Zone enroll request received', payload);
    sendZoneEnrollResponse();
  };

  if (autoEnrollResponse) {
    // Automatically send the enroll response
    device.log('Automatically sending zone enroll response');
    sendZoneEnrollResponse();
  }

  // Register zone state change notification
  cluster.onZoneStatusChangeNotification = async (payload: ZoneStatusChangedPayload): Promise<void> => {
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

  device.log(
    `Initialised IasZone on endpoint ${endpoint}, ${autoEnrollResponse ? 'zone enroll response already sent' : 'waiting for zone enroll request'}`,
  );
}
