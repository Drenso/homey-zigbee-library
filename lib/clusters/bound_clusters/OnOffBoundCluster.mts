import zbClusters, { type OnOffClusterAttributes, type OnOffClusterCommands } from 'zigbee-clusters';
import type { BoundClusterPayloadFromDefinition } from '../../../types/BoundCluster.mjs';

type OffWithEffectPayload = BoundClusterPayloadFromDefinition<OnOffClusterCommands['offWithEffect']>;
type OnWithTimedOffPayload = BoundClusterPayloadFromDefinition<OnOffClusterCommands['onWithTimedOff']>;

export default class OnOffBoundCluster extends zbClusters.BoundCluster<OnOffClusterAttributes, OnOffClusterCommands> {
  public constructor(
    private _handlers: {
      onSetOn?: () => void;
      onSetOff?: () => void;
      onToggle?: () => void;
      offWithEffect?: (payload: OffWithEffectPayload) => void;
      onWithRecallGlobalScene?: () => void;
      onWithTimedOff?: (payload: OnWithTimedOffPayload) => void;
    },
  ) {
    super();
  }

  public setOn(): void {
    this._handlers.onSetOn?.();
  }

  public setOff(): void {
    this._handlers.onSetOff?.();
  }

  public toggle(): void {
    this._handlers.onToggle?.();
  }

  public offWithEffect(payload: OffWithEffectPayload): void {
    this._handlers.offWithEffect?.(payload);
  }

  public onWithRecallGlobalScene(): void {
    this._handlers.onWithRecallGlobalScene?.();
  }

  public onWithTimedOff(payload: OnWithTimedOffPayload): void {
    this._handlers.onWithTimedOff?.(payload);
  }
}
