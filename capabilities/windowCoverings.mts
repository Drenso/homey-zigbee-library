import type { ZigBeeDevice } from 'homey-zigbeedriver';
import type { ZCLNode } from 'zigbee-clusters';
import mapValueRange from '../lib/helper/valueRange.mjs';
import { initLiftPercentageCapability } from './windowCoveringsSet.mjs';
import { initTiltPercentageCapability } from './windowCoveringsTiltSet.mjs';
import { initLiftStateCapability } from './windowCoveringsState.mjs';

export default async function initWindowCoveringsDevice(
  device: ZigbeeWindowCoveringsDevice,
  zclNode: ZCLNode,
  argumentOverrides: Partial<ArgumentOverrides> = {},
): Promise<void> {
  await initLiftPercentageCapability(device, zclNode, argumentOverrides);
  await initLiftStateCapability(device, argumentOverrides);
  await initTiltPercentageCapability(device, zclNode, argumentOverrides);
}

export function parsePercentageValue(value: number): number | null {
  if (value < 0x00 || value > 0x64) return null;
  return mapValueRange(0, 100, 0, 1, value);
}

export const STATE_COMMAND_MAP = {
  up: 'upOpen',
  idle: 'stop',
  down: 'downClose',
} as const;

export type StateCommand = keyof typeof STATE_COMMAND_MAP;

export function invertStateCommand(command: StateCommand): StateCommand {
  switch (command) {
    case 'up':
      return 'down';
    case 'down':
      return 'up';
    default:
      return command;
  }
}

export interface WindowCoveringsProperties {
  positionUpdateDebounce?: NodeJS.Timeout | null;
  positionUpdateDebounceActive?: boolean;
}

export interface ZigbeeWindowCoveringsDevice extends ZigBeeDevice, WindowCoveringsProperties {}

export type ArgumentOverrides = {
  endpointId?: number;
  invertPercentage?: boolean;
  invertSetting?: string;
  positionUpdatesAfterSetDebounceTime?: number;
};
