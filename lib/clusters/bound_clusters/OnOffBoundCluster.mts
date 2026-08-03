import zbClusters, { type OnOffClusterAttributes, type OnOffClusterCommands } from 'zigbee-clusters';
import type { BoundClusterPayloadFromDefinition } from '../../../types/BoundCluster.mjs';
import type {BoundClusterMeta} from './BoundClusterMeta.mjs';

export type OffWithEffectPayload = BoundClusterPayloadFromDefinition<OnOffClusterCommands['offWithEffect']>;
export type OnWithTimedOffPayload = BoundClusterPayloadFromDefinition<OnOffClusterCommands['onWithTimedOff']>;

export default class OnOffBoundCluster extends zbClusters.BoundCluster<OnOffClusterAttributes, OnOffClusterCommands> {
  public constructor(
    private _handlers: {
      onSetOn?: (meta: BoundClusterMeta) => void;
      onSetOff?: (meta: BoundClusterMeta) => void;
      onToggle?: (meta: BoundClusterMeta) => void;
      offWithEffect?: (payload: OffWithEffectPayload, meta: BoundClusterMeta) => void;
      onWithRecallGlobalScene?: (meta: BoundClusterMeta) => void;
      onWithTimedOff?: (payload: OnWithTimedOffPayload, meta: BoundClusterMeta) => void;
    },
  ) {
    super();
  }

  public setOn(meta: BoundClusterMeta): void {
    this._handlers.onSetOn?.(meta);
  }

  public setOff(meta: BoundClusterMeta): void {
    this._handlers.onSetOff?.(meta);
  }

  public toggle(meta: BoundClusterMeta): void {
    this._handlers.onToggle?.(meta);
  }

  public offWithEffect(payload: OffWithEffectPayload, meta: BoundClusterMeta): void {
    this._handlers.offWithEffect?.(payload, meta);
  }

  public onWithRecallGlobalScene(meta: BoundClusterMeta): void {
    this._handlers.onWithRecallGlobalScene?.(meta);
  }

  public onWithTimedOff(payload: OnWithTimedOffPayload, meta: BoundClusterMeta): void {
    this._handlers.onWithTimedOff?.(payload, meta);
  }
}
