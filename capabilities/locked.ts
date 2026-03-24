import { ZigBeeDevice } from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {DefaultConfiguration, initReadCommandCapability} from '../lib/attributeDevice';
import {DoorLockClusterAttributes} from 'zigbee-clusters/index';

type LockState = DoorLockClusterAttributes['lockState']

type ArgumentOverrides = DefaultConfiguration & {
  reportParser: (value: LockState) => unknown,
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
  const command = (value: boolean): string => value ? 'lockDoor' : 'unlockDoor';
  // Return empty object, the command specifies the action for this cluster ('lockDoor'/unlockDoor')
  const commandArgParser = (): Record<string, never> => ({});

  await initReadCommandCapability(
    device,
    zclNode,
    capabilityId,
    CLUSTER.DOOR_LOCK,
    command,
    commandArgParser,
    'lockState',
    reportParser,
    undefined,
    endpointId,
  );
}
