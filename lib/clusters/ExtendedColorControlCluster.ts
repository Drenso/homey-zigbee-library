import {
  Cluster,
  ColorControlCluster,
  type ScenesClusterAttributes,
  type ScenesClusterCommands,
  type types,
  ZCLDataTypes,
} from 'zigbee-clusters';

const MoveMode = {
  stop: 0x00,
  up: 0x01,
  reserved: 0x02,
  down: 0x03,
};

const Attributes = {} satisfies types.AttributeDefinitions;
const Commands = {
  moveHue: {
    id: 0x01,
    args: {
      moveMode: ZCLDataTypes.enum8(MoveMode),
      rate: ZCLDataTypes.uint8,
    },
  },
  stopMoveStep: {id: 0x47},
  moveColorTemperature: {
    id: 0x4b, args: {
      moveMode: ZCLDataTypes.enum8(MoveMode),
      rate: ZCLDataTypes.uint16,
      colorTemperatureMinimumMireds: ZCLDataTypes.uint16,
      colorTemperatureMaximumMireds: ZCLDataTypes.uint16,
    },
  },
} satisfies types.CommandDefinitions;

export type ExtendedColorControlClusterAttributes = typeof Attributes & ScenesClusterAttributes;
export type ExtendedColorControlClusterCommands = typeof Commands & ScenesClusterCommands;

class ExtendedColorControlCluster extends ColorControlCluster<ExtendedColorControlClusterAttributes, ExtendedColorControlClusterCommands> {
  public static get ATTRIBUTES(): ExtendedColorControlClusterAttributes {
    return {
      ...super.ATTRIBUTES,
      ...Attributes,
    };
  }

  public static get COMMANDS(): ExtendedColorControlClusterCommands {
    return {
      ...super.COMMANDS,
      ...Commands,
    };
  }
}

Cluster.addCluster(ExtendedColorControlCluster);

export default ExtendedColorControlCluster;
