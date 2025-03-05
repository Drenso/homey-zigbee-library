import {ZigBeeDevice} from 'homey-zigbeedriver';
import {Cluster, ZCLNode} from 'zigbee-clusters';
import mapValueRange from '../lib/helper/valueRange';
import {initLiftPercentageCapability} from "./windowCoveringsSet";
import {initTiltPercentageCapability} from "./windowCoveringsTiltSet";
import {initLiftStateCapability} from "./windowCoveringsState";

export default async function initWindowCoveringsDevice(
  device: ZigbeeWindowCoveringsDevice,
  zclNode: ZCLNode,
  argumentOverrides: Partial<ArgumentOverrides> = {},
): Promise<void> {
  await initLiftPercentageCapability(device, zclNode, argumentOverrides);
  await initLiftStateCapability(device);
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
    case "up": return "down";
    case "down": return "up";
    default: return command;
  }
}

export interface WindowCoveringsProperties {
  positionUpdateDebounce?: NodeJS.Timeout | null;
  positionUpdateDebounceActive?: boolean;
}

export interface ZigbeeWindowCoveringsDevice extends ZigBeeDevice, WindowCoveringsProperties {
}

export type WindowCoveringsCluster = Cluster & {
  upOpen: () => Promise<void>;
  downClose: () => Promise<void>;
  stop: () => Promise<void>;
};

export type ArgumentOverrides = {
  endpointId?: number,
  invertPercentage?: boolean,
  invertSetting?: string,
}
