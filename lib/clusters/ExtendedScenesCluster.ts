import {
  Cluster,
  ScenesCluster,
  type ScenesClusterAttributes,
  type ScenesClusterCommands,
  type types,
  ZCLDataTypes,
} from 'zigbee-clusters';

const Attributes = {} satisfies types.AttributeDefinitions;
const Commands = {
  addScene: {
    id: 0x00,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8,
      transitionTime: ZCLDataTypes.uint16,
      sceneName: ZCLDataTypes.string,
    },
  },
  viewScene: {
    id: 0x01,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8,
    },
  },
  removeScene: {
    id: 0x02,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8,
    },
  },
  removeAllScenes: {
    id: 0x03,
    args: {
      groupId: ZCLDataTypes.uint16,
    },
  },
  storeScene: {
    id: 0x04,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8,
    },
  },
  recallScene: {
    id: 0x05,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8,
      transitionTime: ZCLDataTypes.uint16,
    },
  },
  getSceneMembership: {
    id: 0x06,
    args: {
      groupId: ZCLDataTypes.uint16,
    },
  },
  enhancedAddScene: {
    id: 0x40,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8,
      transitionTime: ZCLDataTypes.uint16,
      sceneName: ZCLDataTypes.string,
    },
  },
  enhancedViewScene: {
    id: 0x41,
    args: {
      groupId: ZCLDataTypes.uint16,
      sceneId: ZCLDataTypes.uint8,
    },
  },
  copyScene: {
    id: 0x42,
    args: {
      mode: ZCLDataTypes.map8('copyAllScenes'),
      groupIdFrom: ZCLDataTypes.uint16,
      sceneIdFrom: ZCLDataTypes.uint8,
      groupIdTo: ZCLDataTypes.uint16,
      sceneIdTo: ZCLDataTypes.uint8,
    },
  },
} satisfies types.CommandDefinitions;

export type ExtendedScenesClusterAttributes = typeof Attributes & ScenesClusterAttributes;
export type ExtendedScenesClusterCommands = typeof Commands & ScenesClusterCommands;

class ExtendedScenesCluster extends ScenesCluster<ExtendedScenesClusterAttributes, ExtendedScenesClusterCommands> {
  public static get ATTRIBUTES(): ExtendedScenesClusterAttributes {
    return {
      ...super.ATTRIBUTES,
      ...Attributes,
    };
  }

  public static get COMMANDS(): ExtendedScenesClusterCommands {
    return {
      ...super.COMMANDS,
      ...Commands,
    };
  }
}

Cluster.addCluster(ExtendedScenesCluster);

export default ExtendedScenesCluster;
