import zbClusters, {type types} from 'zigbee-clusters';
import type {
  ExtendedScenesClusterAttributes,
  ExtendedScenesClusterCommands,
} from '../ExtendedScenesCluster.js';

export type AddScenePayload = types.FromZCLDataType<ExtendedScenesClusterCommands['addScene']['args']>;
export type ViewScenePayload = types.FromZCLDataType<ExtendedScenesClusterCommands['viewScene']['args']>;
export type RemoveScenePayload = types.FromZCLDataType<ExtendedScenesClusterCommands['removeScene']['args']>;
export type RemoveAllScenesPayload = types.FromZCLDataType<ExtendedScenesClusterCommands['removeAllScenes']['args']>;
export type StoreScenePayload = types.FromZCLDataType<ExtendedScenesClusterCommands['storeScene']['args']>;
export type RecallScenePayload = types.FromZCLDataType<ExtendedScenesClusterCommands['recallScene']['args']>;
export type GetSceneMembershipPayload = types.FromZCLDataType<
  ExtendedScenesClusterCommands['getSceneMembership']['args']
>;
export type EnhancedAddScenePayload = types.FromZCLDataType<ExtendedScenesClusterCommands['enhancedAddScene']['args']>;
export type EnhancedViewScenePayload = types.FromZCLDataType<ExtendedScenesClusterCommands['enhancedViewScene']['args']>;
export type CopyScenePayload = types.FromZCLDataType<ExtendedScenesClusterCommands['copyScene']['args']>;

export default class ScenesBoundCluster extends zbClusters.BoundCluster<ExtendedScenesClusterAttributes, ExtendedScenesClusterCommands> {
  public constructor(
    private _handlers: {
      onAddScene?: (payload: AddScenePayload) => void;
      onViewScene?: (payload: ViewScenePayload) => void;
      onRemoveScene?: (payload: RemoveScenePayload) => void;
      onRemoveAllScenes?: (payload: RemoveAllScenesPayload) => void;
      onStoreScene?: (payload: StoreScenePayload) => void;
      onRecallScene?: (payload: RecallScenePayload) => void;
      onGetSceneMembership?: (payload: GetSceneMembershipPayload) => void;
      onEnhancedAddScene?: (payload: EnhancedAddScenePayload) => void;
      onEnhancedViewScene?: (payload: EnhancedViewScenePayload) => void;
      onCopyScene?: (payload: CopyScenePayload) => void;
    },
  ) {
    super();
  }

  public addScene(payload: AddScenePayload): void {
    this._handlers.onAddScene?.(payload);
  }

  public viewScene(payload: ViewScenePayload): void {
    this._handlers.onViewScene?.(payload);
  }

  public removeScene(payload: RemoveScenePayload): void {
    this._handlers.onRemoveScene?.(payload);
  }

  public removeAllScenes(payload: RemoveAllScenesPayload): void {
    this._handlers.onRemoveAllScenes?.(payload);
  }

  public storeScene(payload: StoreScenePayload): void {
    this._handlers.onStoreScene?.(payload);
  }

  public recallScene(payload: RecallScenePayload): void {
    this._handlers.onRecallScene?.(payload);
  }

  public getSceneMembership(payload: GetSceneMembershipPayload): void {
    this._handlers.onGetSceneMembership?.(payload);
  }

  public enhancedAddScene(payload: EnhancedAddScenePayload): void {
    this._handlers.onEnhancedAddScene?.(payload);
  }

  public enhancedViewScene(payload: EnhancedViewScenePayload): void {
    this._handlers.onEnhancedViewScene?.(payload);
  }

  public copyScene(payload: CopyScenePayload): void {
    this._handlers.onCopyScene?.(payload);
  }
}
