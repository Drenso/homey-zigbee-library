import { AttributesDefinition, CommandDefinitions, CommandFunctions, WindowCoveringCluster as HomeyWindowCoveringCluster, ZCLDataTypes } from 'zigbee-clusters';
import {DefaultResponseCommand} from "./ZCL";

export const WINDOW_COVERING_TYPE_ENUM = {
  rollershade: 0x00,
  rollershade2Motor: 0x01,
  rollershadeExterior: 0x02,
  rollershadeExterior2Motor: 0x03,
  drapery: 0x04,
  awning: 0x05,
  shutter: 0x06,
  tiltBlindTiltOnly: 0x07,
  tiltBlindLiftAndTilt: 0x08,
  projectorScreen: 0x09,
};

export const CONFIG_STATUS_FLAGS = ['operational', 'online', 'reversalLiftCommands', 'controlLift', 'controlTilt', 'encoderLift', 'encoderTilt', null] as const;

export const WINDOW_COVERING_MODE_FLAGS = ['motorReversed', 'calibrationMode', 'maintenanceMode', 'LedFeedback', null, null, null, null] as const;

export type WindowCoveringClusterWithFunctions = WindowCoveringCluster & CommandFunctions<typeof CommandsReceived>;

export type WindowCoveringClusterAttribute = keyof typeof Attributes;
export type WindowCoveringClusterAttributeValues = typeof Attributes;

const Attributes = {
  windowCoveringType: {
    id: 0x00,
    type: ZCLDataTypes.enum8(WINDOW_COVERING_TYPE_ENUM),
  },
  physicalClosedLimitLift: {
    id: 0x01,
    type: ZCLDataTypes.uint16,
  },
  physicalClosedLimitTilt: {
    id: 0x02,
    type: ZCLDataTypes.uint16,
  },
  currentPositionLift: {
    id: 0x03,
    type: ZCLDataTypes.uint16,
  },
  currentPositionTilt: {
    id: 0x04, type: ZCLDataTypes.uint16,
  },
  numberofActuationsLift: {
    id: 0x05,
    type: ZCLDataTypes.uint16,
  },
  numberofActuationsTilt: {
    id: 0x06,
    type: ZCLDataTypes.uint16,
  },
  configStatus: {
    id: 0x07,
    type: ZCLDataTypes.map8(CONFIG_STATUS_FLAGS),
  },
  currentPositionLiftPercentage: {
    id: 0x08,
    type: ZCLDataTypes.uint8,
  },
  currentPositionTiltPercentage: {
    id: 0x09,
    type: ZCLDataTypes.uint8,
  },
  installedOpenLimitLift: {
    id: 0x0010,
    type: ZCLDataTypes.uint16,
  },
  installedClosedLimitLift: {
    id: 0x0011,
    type: ZCLDataTypes.uint16,
  },
  installedOpenLimitTilt: {
    id: 0x0012,
    type: ZCLDataTypes.uint16,
  },
  installedClosedLimitTilt: {
    id: 0x0013,
    type: ZCLDataTypes.uint16,
  },
  velocityLift: {
    id: 0x0014,
    type: ZCLDataTypes.uint16,
  },
  accelerationTimeLift: {
    id: 0x0015,
    type: ZCLDataTypes.uint16,
  },
  decelerationTimeLift: {
    id: 0x0016,
    type: ZCLDataTypes.uint16,
  },
  mode: {
    id: 0x0017,
    type: ZCLDataTypes.map8(WINDOW_COVERING_MODE_FLAGS),
  },
  intermediateSetPointsLift: {
    id: 0x0018,
    type: ZCLDataTypes.octstr,
  },
  intermediateSetPointsTilt: {
    id: 0x0019,
    type: ZCLDataTypes.octstr,
  },
} as const;

const CommandsReceived = {
  upOpen: { id: 0x00 },
  downClose: { id: 0x01 },
  stop: { id: 0x02 },
  goToLiftValue: {
    id: 0x04,
    args: {
      liftValue: ZCLDataTypes.uint16,
    },
  },
  goToLiftPercentage: {
    id: 0x05,
    args: {
      percentageLiftValue: ZCLDataTypes.uint8,
    },
  },
  goToTiltValue: {
    id: 0x07,
    args: {
      tiltValue: ZCLDataTypes.uint16,
    },
  },
  goToTiltPercentage: {
    id: 0x08,
    args: {
      percentageTiltValue: ZCLDataTypes.uint8,
    },
  },
} as const;

const CommandsGenerated = {

} as const;

class WindowCoveringCluster extends HomeyWindowCoveringCluster {
  static get ATTRIBUTES(): AttributesDefinition {
    return {
      ...super.ATTRIBUTES,
      ...Attributes,
    } as const;
  }

  static get COMMANDS(): CommandDefinitions {
    return {
      ...super.COMMANDS,
      ...CommandsReceived,
      ...CommandsGenerated,
    } as const;
  }

  readAttributes<T extends keyof typeof Attributes>(attributeNames: T[], opts?: { timeout: number }): Promise<{
    [p in T]: typeof Attributes[p]["type"]
  }> {
    return super.readAttributes(attributeNames, opts) as unknown as Promise<{
      [p in T]: typeof Attributes[p]["type"]
    }>;
  }

  writeAttributes<T extends keyof typeof Attributes>(attributes: {
    [p in T]: typeof Attributes[p]["type"]
  }): Promise<{
    [p in T]: DefaultResponseCommand
  }> {
    return super.writeAttributes(attributes) as unknown as Promise<{
      [p in T]: DefaultResponseCommand
    }>;
  }
}

export default WindowCoveringCluster;
