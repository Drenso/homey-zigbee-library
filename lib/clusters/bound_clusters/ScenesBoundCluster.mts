import zbClusters from 'zigbee-clusters';
import type { ExtendedScenesClusterAttributes, ExtendedScenesClusterCommands } from '../ExtendedScenesCluster.mjs';
import type { BoundClusterPayloadFromDefinition } from '../../../types/BoundCluster.mjs';
import type {BoundClusterMeta} from './BoundClusterMeta.mjs';

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
      onAddScene?: (payload: AddScenePayload, meta: BoundClusterMeta) => void;
      onViewScene?: (payload: ViewScenePayload, meta: BoundClusterMeta) => void;
      onRemoveScene?: (payload: RemoveScenePayload, meta: BoundClusterMeta) => void;
      onRemoveAllScenes?: (payload: RemoveAllScenesPayload, meta: BoundClusterMeta) => void;
      onStoreScene?: (payload: StoreScenePayload, meta: BoundClusterMeta) => void;
      onRecallScene?: (payload: RecallScenePayload, meta: BoundClusterMeta) => void;
      onGetSceneMembership?: (payload: GetSceneMembershipPayload, meta: BoundClusterMeta) => void;
      onEnhancedAddScene?: (payload: EnhancedAddScenePayload, meta: BoundClusterMeta) => void;
      onEnhancedViewScene?: (payload: EnhancedViewScenePayload, meta: BoundClusterMeta) => void;
      onCopyScene?: (payload: CopyScenePayload, meta: BoundClusterMeta) => void;
    },
  ) {
    super();
  }

  public addScene(payload: AddScenePayload, meta: BoundClusterMeta): void {
    this._handlers.onAddScene?.(payload, meta);
  }

  public viewScene(payload: ViewScenePayload, meta: BoundClusterMeta): void {
    this._handlers.onViewScene?.(payload, meta);
  }

  public removeScene(payload: RemoveScenePayload, meta: BoundClusterMeta): void {
    this._handlers.onRemoveScene?.(payload, meta);
  }

  public removeAllScenes(payload: RemoveAllScenesPayload, meta: BoundClusterMeta): void {
    this._handlers.onRemoveAllScenes?.(payload, meta);
  }

  public storeScene(payload: StoreScenePayload, meta: BoundClusterMeta): void {
    this._handlers.onStoreScene?.(payload, meta);
  }

  public recallScene(payload: RecallScenePayload, meta: BoundClusterMeta): void {
    this._handlers.onRecallScene?.(payload, meta);
  }

  public getSceneMembership(payload: GetSceneMembershipPayload, meta: BoundClusterMeta): void {
    this._handlers.onGetSceneMembership?.(payload, meta);
  }

  public enhancedAddScene(payload: EnhancedAddScenePayload, meta: BoundClusterMeta): void {
    this._handlers.onEnhancedAddScene?.(payload, meta);
  }

  public enhancedViewScene(payload: EnhancedViewScenePayload, meta: BoundClusterMeta): void {
    this._handlers.onEnhancedViewScene?.(payload, meta);
  }

  public copyScene(payload: CopyScenePayload, meta: BoundClusterMeta): void {
    this._handlers.onCopyScene?.(payload, meta);
  }
}
