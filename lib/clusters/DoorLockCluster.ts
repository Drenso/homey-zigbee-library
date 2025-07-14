import {
  AttributesDefinition,
  Cluster,
  CommandDefinitions,
  CommandFunctions,
  DoorLockCluster as HomeyDoorLockCluster,
  ZCLDataTypes,
} from 'zigbee-clusters';
import {DefaultResponseCommand} from "./ZCL";

export const LOCK_STATE_ENUM = {
  not_fully_locked: 0x00,
  locked: 0x01,
  unlocked: 0x02,
  undefined: 0xFF,
} as const;

export type LockState = keyof typeof LOCK_STATE_ENUM;

export const LOCK_TYPE_ENUM = {
  dead_bolt: 0x00,
  magnetic: 0x01,
  other: 0x02,
  mortise: 0x03,
  rim: 0x04,
  latch_bolt: 0x05,
  cylindrical_lock: 0x06,
  tubular_lock: 0x07,
  interconnected_lock: 0x08,
  dead_latch: 0x09,
  door_furniture: 0x0A,
} as const;

export type LockType = keyof typeof LOCK_TYPE_ENUM;

export const USER_STATUS_ENUM = {
  available: 0x00,
  enabled: 0x01,
  disabled: 0x03,
  not_supported: 0xFF,
} as const;

export type UserStatus = keyof typeof USER_STATUS_ENUM;

export const USER_TYPE_ENUM = {
  unrestricted: 0,
  yearDaySchedule: 1,
  weekdaySchedule: 2,
  master: 3,
  nonAccess: 4,
};

export type UserType = keyof typeof USER_TYPE_ENUM;

export const SET_PIN_CODE_RESPONSE_STATUS_ENUM = {
  success: 0,
  general_failure: 1,
  memory_full: 2,
  duplicate_code_error: 3,
};

export type SetPinResponseStatus = keyof typeof SET_PIN_CODE_RESPONSE_STATUS_ENUM;

export const GENERAL_RESPONSE_STATUS_ENUM = {
  pass: 0,
  fail: 1,
};

export type GeneralResponseStatus = keyof typeof GENERAL_RESPONSE_STATUS_ENUM;

export const OPERATING_MODE_ENUM = {
  normal: 0x00,
  vacation: 0x01,
  privacy: 0x02,
  norRfOperation: 0x03,
  passage: 0x04,
} as const;

export type OperatingMode = keyof typeof OPERATING_MODE_ENUM;

export type DoorLockClusterWithFunctions = DoorLockCluster & CommandFunctions<typeof CommandsReceived>;

export type DoorLockClusterAttributes = keyof typeof Attributes;

const Attributes = {
  lockState: {
    id: 0x0000,
    type: ZCLDataTypes.enum8(LOCK_STATE_ENUM),
  },
  lockType: {
    id: 0x0001,
    type: ZCLDataTypes.enum8(LOCK_TYPE_ENUM),
  },
  actuatorEnabled: {
    id: 0x0002,
    type: ZCLDataTypes.bool,
  },
  numberOfHolidaySchedulesSupported: {
    id: 0x0016,
    type: ZCLDataTypes.uint8,
  },
  maxPinCodeLength: {
    id: 0x0017,
    type: ZCLDataTypes.uint8,
  },
  minPinCodeLength: {
    id: 0x0018,
    type: ZCLDataTypes.uint8,
  },
  enableLogging: {
    id: 0x0020,
    type: ZCLDataTypes.bool,
  },
  language: {
    id: 0x0021,
    type: ZCLDataTypes.string,
  },
  autoRelockTime: {
    id: 0x0023,
    type: ZCLDataTypes.uint32,
  },
  soundVolume: {
    id: 0x0024,
    type: ZCLDataTypes.uint8,
  },
  operatingMode: {
    id: 0x0025,
    type: ZCLDataTypes.enum8(OPERATING_MODE_ENUM),
  },
} as const;

const CommandsReceived = {
  lockDoor: {
    id: 0x00,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
  },
  unlockDoor: {
    id: 0x01,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
  },
  toggle: {
    id: 0x02,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
  },
  unlockWithTimeout: {
    id: 0x03,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
  getLogRecord: {
    id: 0x04,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
  setPinCode: {
    id: 0x05,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      userId: ZCLDataTypes.uint16,
      userStatus: ZCLDataTypes.enum8(USER_STATUS_ENUM),
      userType: ZCLDataTypes.enum8(USER_TYPE_ENUM),
      pin: ZCLDataTypes.octstr,
    },
  },
  getPinCode: {
    id: 0x06,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      userId: ZCLDataTypes.uint16,
    },
  },
  clearPinCode: {
    id: 0x07,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      userId: ZCLDataTypes.uint16,
    },
  },
  clearAllPinCodes: {
    id: 0x08,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
  setUserStatus: {
    id: 0x09,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      userId: ZCLDataTypes.uint16,
      userStatus: ZCLDataTypes.enum8(USER_STATUS_ENUM),
    },
  },
  getUserStatus: {
    id: 0x0A,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    args: {
      userId: ZCLDataTypes.uint16,
    },
  },
  setWeekdaySchedule: {
    id: 0x0B,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
  getWeekdaySchedule: {
    id: 0x0C,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
  clearWeekdaySchedule: {
    id: 0x0D,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
  setYearDaySchedule: {
    id: 0x0E,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
  getYearDaySchedule: {
    id: 0x0F,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
  clearYearDaySchedule: {
    id: 0x10,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
  setUserType: {
    id: 0x14,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
  getUserType: {
    id: 0x15,
    direction: Cluster.DIRECTION_CLIENT_TO_SERVER,
    // args
  },
} as const;

const CommandsGenerated = {
  lockDoorResponse: {
    id: 0x00,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  unlockDoorResponse: {
    id: 0x01,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  toggleResponse: {
    id: 0x02,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  unlockWithTimeoutResponse: {
    id: 0x03,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  getLogRecordResponse: {
    id: 0x04,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  setPinCodeResponse: {
    id: 0x05,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      status: ZCLDataTypes.enum8(SET_PIN_CODE_RESPONSE_STATUS_ENUM),
    },
  },
  getPinCodeResponse: {
    id: 0x06,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      userId: ZCLDataTypes.uint16,
      userStatus: ZCLDataTypes.enum8(USER_STATUS_ENUM),
      userType: ZCLDataTypes.enum8(USER_TYPE_ENUM),
      pin: ZCLDataTypes.octstr,
    },
  },
  clearPinCodeResponse: {
    id: 0x07,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      status: ZCLDataTypes.enum8(GENERAL_RESPONSE_STATUS_ENUM),
    },
  },
  clearAllPinCodesResponse: {
    id: 0x08,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  setUserStatusResponse: {
    id: 0x09,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      status: ZCLDataTypes.enum8(GENERAL_RESPONSE_STATUS_ENUM),
    },
  },
  getUsersStatusResponse: {
    id: 0x0A,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    args: {
      userId: ZCLDataTypes.uint16,
      userStatus: ZCLDataTypes.enum8(USER_STATUS_ENUM),
    },
  },
  setWeekdayScheduleResponse: {
    id: 0x0B,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  getWeekdayScheduleResponse: {
    id: 0x0C,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  clearWeekdayScheduleResponse: {
    id: 0x0D,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  setYearDayScheduleResponse: {
    id: 0x0E,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  getYearDayScheduleResponse: {
    id: 0x0F,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  clearYearDayScheduleResponse: {
    id: 0x10,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  setUserTypeResponse: {
    id: 0x14,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  getUserTypeResponse: {
    id: 0x15,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  operatingEventNotification: {
    id: 0x20,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
  programmingEventNotification: {
    id: 0x21,
    direction: Cluster.DIRECTION_SERVER_TO_CLIENT,
    // args
  },
} as const;

class DoorLockCluster extends HomeyDoorLockCluster {
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

export default DoorLockCluster;
