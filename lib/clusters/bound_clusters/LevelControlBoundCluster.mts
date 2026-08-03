import zbClusters, { type LevelControlClusterAttributes, type LevelControlClusterCommands } from 'zigbee-clusters';
import type { BoundClusterPayloadFromDefinition } from '../../../types/BoundCluster.mjs';
import type {BoundClusterMeta} from './BoundClusterMeta.mjs';

export type MoveToLevelPayload = BoundClusterPayloadFromDefinition<LevelControlClusterCommands['moveToLevel']>;
export type MovePayload = BoundClusterPayloadFromDefinition<LevelControlClusterCommands['move']>;
export type StepPayload = BoundClusterPayloadFromDefinition<LevelControlClusterCommands['step']>;
export type MoveToLevelWithOnOffPayload = BoundClusterPayloadFromDefinition<
  LevelControlClusterCommands['moveToLevelWithOnOff']
>;
export type MoveWithOnOffPayload = BoundClusterPayloadFromDefinition<LevelControlClusterCommands['moveWithOnOff']>;
export type StepWithOnOffPayload = BoundClusterPayloadFromDefinition<LevelControlClusterCommands['stepWithOnOff']>;

export default class LevelControlBoundCluster extends zbClusters.BoundCluster<
  LevelControlClusterAttributes,
  LevelControlClusterCommands
> {
  public constructor(
    private _handlers: {
      onMoveToLevel?: (payload: MoveToLevelPayload, meta: BoundClusterMeta) => void;
      onMove?: (payload: MovePayload, meta: BoundClusterMeta) => void;
      onStep?: (payload: StepPayload, meta: BoundClusterMeta) => void;
      onStop?: (meta: BoundClusterMeta) => void;
      onMoveToLevelWithOnOff?: (payload: MoveToLevelWithOnOffPayload, meta: BoundClusterMeta) => void;
      onMoveWithOnOff?: (payload: MoveWithOnOffPayload, meta: BoundClusterMeta) => void;
      onStepWithOnOff?: (payload: StepWithOnOffPayload, meta: BoundClusterMeta) => void;
      onStopWithOnOff?: (meta: BoundClusterMeta) => void;
    },
  ) {
    super();
  }

  public moveToLevel(payload: MoveToLevelPayload, meta: BoundClusterMeta): void {
    this._handlers.onMoveToLevel?.(payload, meta);
  }

  public move(payload: MovePayload, meta: BoundClusterMeta): void {
    this._handlers.onMove?.(payload, meta);
  }

  public step(payload: StepPayload, meta: BoundClusterMeta): void {
    this._handlers.onStep?.(payload, meta);
  }

  public stop(meta: BoundClusterMeta): void {
    this._handlers.onStop?.(meta);
  }

  public moveToLevelWithOnOff(payload: MoveToLevelWithOnOffPayload, meta: BoundClusterMeta): void {
    this._handlers.onMoveToLevelWithOnOff?.(payload, meta);
  }

  public moveWithOnOff(payload: MoveWithOnOffPayload, meta: BoundClusterMeta): void {
    this._handlers.onMoveWithOnOff?.(payload, meta);
  }

  public stepWithOnOff(payload: StepWithOnOffPayload, meta: BoundClusterMeta): void {
    this._handlers.onStepWithOnOff?.(payload, meta);
  }

  public stopWithOnOff(meta: BoundClusterMeta): void {
    this._handlers.onStopWithOnOff?.(meta);
  }
}
