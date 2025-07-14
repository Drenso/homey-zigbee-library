/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'zigbee-clusters' {
  import EventEmitter from 'events';
  import { ZigBeeNode } from 'homey';
  import {DefaultResponseCommand} from "../../lib/clusters/ZCL";

  function debug(flag?: boolean, namespaces?: string): void;

  export class CLUSTER {
    static BASIC: typeof Cluster;
    static POWER_CONFIGURATION: typeof Cluster;
    static DEVICE_TEMPERATURE: typeof Cluster;
    static IDENTIFY: typeof Cluster;
    static GROUPS: typeof Cluster;
    static SCENES: typeof Cluster;
    static ON_OFF: typeof Cluster;
    static ON_OFF_SWITCH: typeof Cluster;
    static LEVEL_CONTROL: typeof Cluster;
    static ALARMS: typeof Cluster;
    static TIME: typeof Cluster;
    static ANALOG_INPUT: typeof Cluster;
    static ANALOG_OUTPUT: typeof Cluster;
    static ANALOG_VALUE: typeof Cluster;
    static BINARY_INPUT: typeof Cluster;
    static BINARY_OUTPUT: typeof Cluster;
    static BINARY_VALUE: typeof Cluster;
    static MULTI_STATE_INPUT: typeof Cluster;
    static MULTI_STATE_OUTPUT: typeof Cluster;
    static MULTI_STATE_VALUE: typeof Cluster;
    static OTA: typeof Cluster;
    static POWER_PROFILE: typeof Cluster;
    static POLL_CONTROL: typeof Cluster;
    static SHADE_CONFIGURATION: typeof Cluster;
    static DOOR_LOCK: typeof Cluster;
    static WINDOW_COVERING: typeof Cluster;
    static THERMOSTAT: typeof Cluster;
    static PUMP_CONFIGURATION_AND_CONTROL: typeof Cluster;
    static FAN_CONTROL: typeof Cluster;
    static COLOR_CONTROL: typeof Cluster;
    static BALLAST_CONFIGURATION: typeof Cluster;
    static ILLUMINANCE_MEASUREMENT: typeof Cluster;
    static ILLUMINANCE_LEVEL_SENSING: typeof Cluster;
    static TEMPERATURE_MEASUREMENT: typeof Cluster;
    static PRESSURE_MEASUREMENT: typeof Cluster;
    static FLOW_MEASUREMENT: typeof Cluster;
    static RELATIVE_HUMIDITY_MEASUREMENT: typeof Cluster;
    static OCCUPANCY_SENSING: typeof Cluster;
    static IAS_ZONE: typeof Cluster;
    static IAS_ACE: typeof Cluster;
    static IAS_WD: typeof Cluster;
    static METERING: typeof Cluster;
    static ELECTRICAL_MEASUREMENT: typeof Cluster;
    static DIAGNOSTICS: typeof Cluster;
    static TOUCHLINK: typeof Cluster;
  }

  type AttributeDefinition = {
    id: number,
    type: ZCLDataType,
    manufacturerId?: number,
  }

  type AttributesDefinition = {
    [attributeName: string]: AttributeDefinition,
  }

  type CommandDirection = 'DIRECTION_CLIENT_TO_SERVER' | 'DIRECTION_SERVER_TO_CLIENT';

  type CommandDefinition = {
    id: number,
    direction?: CommandDirection,
    args?: {
      [argName: string]: ZCLDataType,
    }
  }

  type CommandDefinitions = {
    [commandName: string]: CommandDefinition,
  }

  type CommandFunctions<T extends CommandDefinitions> = Cluster & {
    [commandName in keyof T]: (T[commandName] extends { args: any }
      ? (a: T[commandName]['args']) => Promise<unknown>
      : () => Promise<unknown>);
  }

  class Cluster extends EventEmitter {
    constructor(endpoint: Endpoint);

    static get ID(): number;

    static get NAME(): string;

    static get ATTRIBUTES(): AttributesDefinition;

    static get COMMANDS(): CommandDefinitions;

    async readAttributes(attributeNames: string[], opts?: { timeout: number }): Promise<{
      [attributeName: string]: any
    }>;

    async writeAttributes(attributes: { [attributeName: string]: any }): Promise<{
      [attributeName: string]: DefaultResponseCommand
    }>;

    async discoverAttributes(): Promise<[string | number]>;

    static addCluster(cluster: typeof Cluster): void;

    nextSeqNr(): number;

    async sendFrame(data: object): Promise<void>;

    static DIRECTION_SERVER_TO_CLIENT = 'DIRECTION_SERVER_TO_CLIENT' as const;
    static DIRECTION_CLIENT_TO_SERVER = 'DIRECTION_CLIENT_TO_SERVER' as const;
  }

  interface Bitmap<T extends ReadonlyArray<string | null>> {
    getBits(): T;
    getBit(index: number): boolean;
    setBit(index: number, value = true): void;
  }

  class WindowCoveringCluster extends Cluster {
  }

  type ZoneEnrollRequestParams = {
    enrollResponseCode: keyof enrollResponseCodes;
    zoneId: number;
  }

  type ZoneStatus =
    'alarm1'
    | 'alarm2'
    | 'tamper'
    | 'battery'
    | 'supervisionReports'
    | 'restoreReports'
    | 'trouble'
    | 'acMains'
    | 'test'
    | 'batteryDefect';

  type ZoneStatusChangedPayload = {
    zoneStatus: Bitmap<ZoneStatus>;
    extendedStatus: number;
    zoneId: number;
    delay: number;
  }

  type enrollResponseCodes = {
    success: 0x00,
    notSupported: 0x01,
    noEnrollPermit: 0x02,
    tooManyZones: 0x03,
  };

  class IASZoneCluster extends Cluster {
    zoneEnrollResponse: (payload: {
      enrollResponseCode: keyof enrollResponseCodes,
      zoneId: number
    }, options?: ZigBeeCommandOptions) => Promise<void>;
    initiateNormalOperationMode: (payload?: Record<string, never>, options?: ZigBeeCommandOptions) => Promise<void>;
  }

  class BoundCluster {
  }

  class Endpoint extends EventEmitter {
    clusters: { [id: string]: Cluster };

    bind(clusterName: string, clusterImpl: BoundCluster);
  }

  class ZCLNode extends EventEmitter {
    constructor(node: ZigBeeNode);

    getLogId(endpointId: number, clusterId: number): string;

    handleFrame(endpointId: number, clusterId: number, frame: any, meta: any): Promise<void>;

    endpoints: { [id: string]: Endpoint };
  }

  class ZCLDataTypes {
    static enum8<T>(enumArgs: T): keyof T;

    static enum16<T>(enumArgs: T): keyof T;

    static uint8: number;
    static uint16: number;
    static uint24: number;
    static uint32: number;
    static int8: number;
    static int16: number;
    static int32: number;

    static map8<T extends(ReadonlyArray<string | null>)>(mapArgs: T): Bitmap<T>;

    static map16<T extends(ReadonlyArray<string | null>)>(mapArgs: T): Bitmap<T>;

    static bool: boolean;
    static octstr: Buffer;
    static string: Buffer;

    static buffer: Buffer;
    static data16: number;
    static Array0<T>(mapArgs: T): keyof T;
    static enum8Status: string;
  }

  type ZCLDataType = ZCLDataTypes[keyof typeof ZCLDataTypes];

  class ZCLStruct {
  }

  class OccupancySensingCluster extends Cluster {}
  class OnOffCluster extends Cluster {}
  class ScenesCluster extends Cluster {}
  class DoorLockCluster extends Cluster {}
  class ElectricalMeasurementCluster extends Cluster {}
  class ThermostatCluster extends Cluster {}
  class TemperatureMeasurementCluster extends Cluster {}
  class MeteringCluster extends Cluster {}
  class BallastConfigurationCluster extends Cluster {}
  class AlarmsCluster extends Cluster {}
}
