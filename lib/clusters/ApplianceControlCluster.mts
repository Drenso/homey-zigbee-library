import type { types } from 'zigbee-clusters';
import zbClusters from 'zigbee-clusters';

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

const DATA_TYPE_ENUM: Record<string, number> = {
  // TODO
};

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

const attributes = {
  startTime: {
    // Encodes time format specified in table 15-4
    id: 0x0000,
    type: zbClusters.ZCLDataTypes.uint16,
  },
  finishTime: {
    // Encodes time format specified in table 15-4
    id: 0x0001,
    type: zbClusters.ZCLDataTypes.uint16,
  },
  remainingTime: {
    // Encodes time format specified in table 15-4
    id: 0x0002,
    type: zbClusters.ZCLDataTypes.uint16,
  },
} as const satisfies types.AttributeDefinitions;

const commandsGenerated = {
  signalStateResponse: {
    id: 0x00,
    direction: zbClusters.Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      applianceStatus: zbClusters.ZCLDataTypes.enum8(APPLIANCE_STATUS_ENUM),
      // Packed enums according to 15-10
      remoteEnableAndDeviceStatusFlags: zbClusters.ZCLDataTypes.uint8,
      // Optional
      applianceStatus2: zbClusters.ZCLDataTypes.uint24,
    },
  },
  signalStateNotification: {
    id: 0x01,
    direction: zbClusters.Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      applianceStatus: zbClusters.ZCLDataTypes.enum8(APPLIANCE_STATUS_ENUM),
      // Packed enums according to 15-10
      remoteEnableAndDeviceStatusFlags: zbClusters.ZCLDataTypes.uint8,
      // Optional
      applianceStatus2: zbClusters.ZCLDataTypes.uint24,
    },
  },
} as const satisfies types.CommandDefinitions;

const commandsReceived = {
  executeCommand: {
    id: 0x00,
    direction: zbClusters.Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      commandId: zbClusters.ZCLDataTypes.enum8(COMMAND_ID_ENUM),
    },
  },
  signalState: {
    id: 0x01,
    direction: zbClusters.Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args: undefined,
    response: commandsGenerated.signalStateResponse,
  },
  writeFunctions: {
    id: 0x02,
    direction: zbClusters.Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      attributeIdentifier: zbClusters.ZCLDataTypes.uint16,
      functionDataType: zbClusters.ZCLDataTypes.enum8(DATA_TYPE_ENUM),
      // Variable
      functionData: zbClusters.ZCLDataTypes.buffer,
    },
  },
  // Resume normal behavior after being in pause mode from a OverloadPauseResume command
  overloadPauseResume: {
    id: 0x03,
    direction: zbClusters.Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args: undefined,
  },
  // Pause the appliance as a consequence of an imminent overload event
  overloadPause: {
    id: 0x04,
    direction: zbClusters.Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args: undefined,
  },
  overloadWarning: {
    id: 0x05,
    direction: zbClusters.Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      warningEvent: zbClusters.ZCLDataTypes.enum8(OVERLOAD_WARNING_ENUM),
    },
  },
} as const satisfies types.CommandDefinitions;

export type ApplianceControlClusterAttributes = typeof attributes;
export type ApplianceControlClusterCommands = typeof commandsReceived & typeof commandsGenerated;

class ApplianceControlCluster<
  Attributes extends types.AttributeDefinitions = ApplianceControlClusterAttributes,
  Commands extends types.CommandDefinitions = ApplianceControlClusterCommands,
> extends zbClusters.Cluster<Attributes, Commands> {
  public static get ID(): number {
    return 0x001b;
  }

  public static get NAME(): string {
    return 'applianceControl';
  }

  public static get ATTRIBUTES(): ApplianceControlClusterAttributes {
    return attributes;
  }

  public static get COMMANDS(): ApplianceControlClusterCommands {
    return {
      ...commandsReceived,
      ...commandsGenerated,
    };
  }

  // Client to Server

  public executeCommand!: (
    args: {
      manufacturerId?: number;
      commandId: CommandId;
    },
    opts?: {
      waitForResponse?: boolean;
      timeout?: number;
      disableDefaultResponse?: boolean;
    },
  ) => Promise<void>;

  public signalState!: (
    args?: {
      manufacturerId?: number;
    },
    opts?: {
      waitForResponse?: boolean;
      timeout?: number;
      disableDefaultResponse?: boolean;
    },
  ) => Promise<void>;

  public writeFunctions!: (
    args: {
      manufacturerId?: number;
      attributeIdentifier: number;
      functionDataType: string;
      functionData: Buffer;
    },
    opts?: {
      waitForResponse?: boolean;
      timeout?: number;
      disableDefaultResponse?: boolean;
    },
  ) => Promise<void>;

  public overloadPauseResume!: (
    args?: {
      manufacturerId?: number;
    },
    opts?: {
      waitForResponse?: boolean;
      timeout?: number;
      disableDefaultResponse?: boolean;
    },
  ) => Promise<void>;

  public overloadPause!: (
    args?: {
      manufacturerId?: number;
    },
    opts?: {
      waitForResponse?: boolean;
      timeout?: number;
      disableDefaultResponse?: boolean;
    },
  ) => Promise<void>;

  public overloadWarning!: (
    args: {
      manufacturerId?: number;
      warningEvent: OverloadWarning;
    },
    opts?: {
      waitForResponse?: boolean;
      timeout?: number;
      disableDefaultResponse?: boolean;
    },
  ) => Promise<void>;

  // Server to Client

  public onSignalStateResponse!: (
    args: {
      applianceStatus: ApplianceStatus;
      // Packed enums according to 15-10
      remoteEnableAndDeviceStatusFlags: number;
      // Optional
      applianceStatus2?: number;
    },
    meta: object,
    frame: object,
    rawFrame: Buffer,
  ) => Promise<void>;

  public onSignalStateNotification!: (
    args: {
      applianceStatus: ApplianceStatus;
      // Packed enums according to 15-10
      remoteEnableAndDeviceStatusFlags: number;
      // Optional
      applianceStatus2?: number;
    },
    meta: object,
    frame: object,
    rawFrame: Buffer,
  ) => Promise<void>;
}

zbClusters.Cluster.addCluster(ApplianceControlCluster);

export default ApplianceControlCluster;
