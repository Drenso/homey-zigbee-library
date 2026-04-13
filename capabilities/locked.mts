import type { ZigBeeDevice } from 'homey-zigbeedriver';
import zbClusters, { type ZCLNode, type DoorLockClusterAttributes } from 'zigbee-clusters';
import type { DefaultConfiguration } from '../lib/attributeDevice.mjs';
import { initReadCommandCapability } from '../lib/attributeDevice.mjs';

type LockState = DoorLockClusterAttributes['lockState'];

type ArgumentOverrides = DefaultConfiguration & {
  reportParser: (value: LockState) => unknown;
};

export default async function initLockedDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'locked',
    // Can be extended to handle the 'not_fully_locked' state
    reportParser = (value: LockState): boolean => value == 'locked',
    endpointId,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  const command = (value: boolean): string => (value ? 'lockDoor' : 'unlockDoor');
  // Return empty object, the command specifies the action for this cluster ('lockDoor'/unlockDoor')
  const commandArgParser = (): Record<string, never> => ({});

  await initReadCommandCapability(
    device,
    zclNode,
    capabilityId,
    zbClusters.CLUSTER.DOOR_LOCK,
    command,
    commandArgParser,
    'lockState',
    reportParser,
    undefined,
    endpointId,
  );
}
