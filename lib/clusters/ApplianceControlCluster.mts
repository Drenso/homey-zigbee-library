import { Cluster, ZCLDataTypes } from 'zigbee-clusters';
import type { DefaultResponseCommand } from './ZCL.mjs';

const COMMAND_ID_ENUM = {
  Start: 0x01,
  Stop: 0x02,
  Pause: 0x03,
  StartSuperFreezing: 0x04,
  StopSuperFreezing: 0x05,
  StartSuperCooling: 0x06,
  StopSuperCooling: 0x07,
  DisableGas: 0x08,
  EnableGas: 0x09,
  // 0x0A - 0x7F = reserved
  // 0x80 - 0xFF = manufacturer specific
} as const;

export type CommandId = keyof typeof COMMAND_ID_ENUM;

const DATA_TYPE_ENUM = {
  // TODO
} as const;

const OVERLOAD_WARNING_ENUM = {
  aboveAvailablePowerLevel: 0x00,
  abovePowerThresholdLevel: 0x01,
  belowAvailablePowerLevel: 0x02,
  belowPowerThresholdLevel: 0x03,
  potentiallyAboveAvailablePowerIfStarted: 0x04,
} as const;

export type OverloadWarning = keyof typeof OVERLOAD_WARNING_ENUM;

const APPLIANCE_STATUS_ENUM = {
  Off: 0x01,
  StandBy: 0x02,
  Programmed: 0x03,
  ProgrammedWaitingToStart: 0x04,
  Running: 0x05,
  Pause: 0x06,
  EndProgrammed: 0x07,
  Failure: 0x08,
  ProgrammeInterrupted: 0x09,
  Idle: 0x0a,
  RinseHold: 0x0b,
  Service: 0x0c,
  SuperFreezing: 0x0d,
  SuperCooling: 0x0e,
  SuperHeating: 0x0f,
  // 0x10 - 0x7F = reserved
  // 0x80 - 0xFF = manufacturer specific
} as const;

export type ApplianceStatus = keyof typeof APPLIANCE_STATUS_ENUM;

export type SignalStateNotification = {
  applianceStatus: ApplianceStatus;
  remoteEnableAndDeviceStatusFlags: number;
  applianceStatus2: number;
};

const Attributes = {
  startTime: {
    // Encodes time format specified in table 15-4
    id: 0x0000,
    type: ZCLDataTypes.uint16,
  },
  finishTime: {
    // Encodes time format specified in table 15-4
    id: 0x0001,
    type: ZCLDataTypes.uint16,
  },
  remainingTime: {
    // Encodes time format specified in table 15-4
    id: 0x0002,
    type: ZCLDataTypes.uint16,
  },
} as const;

const CommandsGenerated = {
  signalStateResponse: {
    id: 0x00,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      applianceStatus: ZCLDataTypes.enum8(APPLIANCE_STATUS_ENUM),
      // Packed enums according to 15-10
      remoteEnableAndDeviceStatusFlags: ZCLDataTypes.uint8,
      // Optional
      applianceStatus2: ZCLDataTypes.uint24,
    },
  },
  signalStateNotification: {
    id: 0x01,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      applianceStatus: ZCLDataTypes.enum8(APPLIANCE_STATUS_ENUM),
      // Packed enums according to 15-10
      remoteEnableAndDeviceStatusFlags: ZCLDataTypes.uint8,
      // Optional
      applianceStatus2: ZCLDataTypes.uint24,
    },
  },
} as const;

const CommandsReceived = {
  executeCommand: {
    id: 0x00,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      commandId: ZCLDataTypes.enum8(COMMAND_ID_ENUM),
    },
  },
  signalState: {
    id: 0x01,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args: undefined,
    response: CommandsGenerated.signalStateResponse,
  },
  writeFunctions: {
    id: 0x02,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      attributeIdentifier: ZCLDataTypes.uint16,
      functionDataType: ZCLDataTypes.enum8(DATA_TYPE_ENUM),
      // Variable
      functionData: ZCLDataTypes.buffer,
    },
  },
  // Resume normal behavior after being in pause mode from a OverloadPauseResume command
  overloadPauseResume: {
    id: 0x03,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args: undefined,
  },
  // Pause the appliance as a consequence of an imminent overload event
  overloadPause: {
    id: 0x04,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args: undefined,
  },
  overloadWarning: {
    id: 0x05,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      warningEvent: ZCLDataTypes.enum8(OVERLOAD_WARNING_ENUM),
    },
  },
} as const;

class ApplianceControlCluster extends Cluster {
  public static get ID(): number {
    return 0x001b;
  }

  public static get NAME(): string {
    return 'applianceControl';
  }

  public static get ATTRIBUTES(): typeof Attributes {
    return Attributes;
  }

  public static get COMMANDS(): typeof CommandsReceived & typeof CommandsGenerated {
    return {
      ...CommandsReceived,
      ...CommandsGenerated,
    };
  }

  public readAttributes<T extends keyof typeof Attributes>(
    attributeNames: T[],
    opts?: { timeout: number },
  ): Promise<{
    [p in T]: (typeof Attributes)[p]['type'];
  }> {
    return super.readAttributes(attributeNames, opts) as unknown as Promise<{
      [p in T]: (typeof Attributes)[p]['type'];
    }>;
  }

  public writeAttributes<T extends keyof typeof Attributes>(attributes: {
    [p in T]: (typeof Attributes)[p]['type'];
  }): Promise<{
    [p in T]: DefaultResponseCommand;
  }> {
    return super.writeAttributes(attributes) as unknown as Promise<{
      [p in T]: DefaultResponseCommand;
    }>;
  }
}

Cluster.addCluster(ApplianceControlCluster);

export default ApplianceControlCluster;
