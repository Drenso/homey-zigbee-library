import zbClusters from 'zigbee-clusters';
import type { ExtendedScenesClusterAttributes, ExtendedScenesClusterCommands } from '../ExtendedScenesCluster.mjs';
import type { BoundClusterPayloadFromDefinition } from '../../../types/BoundCluster.mjs';

export type AddScenePayload = BoundClusterPayloadFromDefinition<ExtendedScenesClusterCommands['addScene']>;
export type ViewScenePayload = BoundClusterPayloadFromDefinition<ExtendedScenesClusterCommands['viewScene']>;
export type RemoveScenePayload = BoundClusterPayloadFromDefinition<ExtendedScenesClusterCommands['removeScene']>;
export type RemoveAllScenesPayload = BoundClusterPayloadFromDefinition<
  ExtendedScenesClusterCommands['removeAllScenes']
>;
export type StoreScenePayload = BoundClusterPayloadFromDefinition<ExtendedScenesClusterCommands['storeScene']>;
export type RecallScenePayload = BoundClusterPayloadFromDefinition<ExtendedScenesClusterCommands['recallScene']>;
export type GetSceneMembershipPayload = BoundClusterPayloadFromDefinition<
  ExtendedScenesClusterCommands['getSceneMembership']
>;
export type EnhancedAddScenePayload = BoundClusterPayloadFromDefinition<
  ExtendedScenesClusterCommands['enhancedAddScene']
>;
export type EnhancedViewScenePayload = BoundClusterPayloadFromDefinition<
  ExtendedScenesClusterCommands['enhancedViewScene']
>;
export type CopyScenePayload = BoundClusterPayloadFromDefinition<ExtendedScenesClusterCommands['copyScene']>;

export default class ScenesBoundCluster extends zbClusters.BoundCluster<
  ExtendedScenesClusterAttributes,
  ExtendedScenesClusterCommands
> {
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
