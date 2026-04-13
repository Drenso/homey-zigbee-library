import type { ArgumentOverrides, StateCommand, ZigbeeWindowCoveringsDevice } from './windowCoverings.mjs';
import { invertStateCommand, STATE_COMMAND_MAP } from './windowCoverings.mjs';
import { CLUSTER } from 'zigbee-clusters';

const CLUSTER_SPEC = CLUSTER.WINDOW_COVERING;

const LIFT_STATE_CAPABILITY = 'windowcoverings_state';

export async function initLiftStateCapability(
  device: ZigbeeWindowCoveringsDevice,
  { endpointId, invertSetting }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  if (!device.hasCapability(LIFT_STATE_CAPABILITY)) {
    return;
  }

  device.log(`Initialising ${LIFT_STATE_CAPABILITY} capability`);

  const endpoint = endpointId ?? device.getClusterEndpoint(CLUSTER_SPEC) ?? 1;

  const set = (value: StateCommand): (typeof STATE_COMMAND_MAP)[StateCommand] => {
    if (invertSetting !== undefined && device.getSetting(invertSetting)) {
      value = invertStateCommand(value);
    }
    return STATE_COMMAND_MAP[value];
  };

  device.registerCapability(LIFT_STATE_CAPABILITY, CLUSTER_SPEC, {
    endpoint,
    set: set,
    setParser: () => ({}),
  });

  device.log(`Initialised ${LIFT_STATE_CAPABILITY} capability`);
}
