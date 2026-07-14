import zbClusters, { type LevelControlClusterAttributes, type LevelControlClusterCommands } from 'zigbee-clusters';
import type { BoundClusterPayloadFromDefinition } from '../../../types/BoundCluster.mjs';

type MoveToLevelPayload = BoundClusterPayloadFromDefinition<LevelControlClusterCommands['moveToLevel']>;
type MovePayload = BoundClusterPayloadFromDefinition<LevelControlClusterCommands['move']>;
type StepPayload = BoundClusterPayloadFromDefinition<LevelControlClusterCommands['step']>;
type MoveToLevelWithOnOffPayload = BoundClusterPayloadFromDefinition<
  LevelControlClusterCommands['moveToLevelWithOnOff']
>;
type MoveWithOnOffPayload = BoundClusterPayloadFromDefinition<LevelControlClusterCommands['moveWithOnOff']>;
type StepWithOnOffPayload = BoundClusterPayloadFromDefinition<LevelControlClusterCommands['stepWithOnOff']>;

export default class LevelControlBoundCluster extends zbClusters.BoundCluster<
  LevelControlClusterAttributes,
  LevelControlClusterCommands
> {
  public constructor(
    private _handlers: {
      onMoveToLevel?: (payload: MoveToLevelPayload) => void;
      onMove?: (payload: MovePayload) => void;
      onStep?: (payload: StepPayload) => void;
      onStop?: () => void;
      onMoveToLevelWithOnOff?: (payload: MoveToLevelWithOnOffPayload) => void;
      onMoveWithOnOff?: (payload: MoveWithOnOffPayload) => void;
      onStepWithOnOff?: (payload: StepWithOnOffPayload) => void;
      onStopWithOnOff?: () => void;
    },
  ) {
    super();
  }

  public moveToLevel(payload: MoveToLevelPayload): void {
    this._handlers.onMoveToLevel?.(payload);
  }

  public move(payload: MovePayload): void {
    this._handlers.onMove?.(payload);
  }

  public step(payload: StepPayload): void {
    this._handlers.onStep?.(payload);
  }

  public stop(): void {
    this._handlers.onStop?.();
  }

  public moveToLevelWithOnOff(payload: MoveToLevelWithOnOffPayload): void {
    this._handlers.onMoveToLevelWithOnOff?.(payload);
  }

  public moveWithOnOff(payload: MoveWithOnOffPayload): void {
    this._handlers.onMoveWithOnOff?.(payload);
  }

  public stepWithOnOff(payload: StepWithOnOffPayload): void {
    this._handlers.onStepWithOnOff?.(payload);
  }

  public stopWithOnOff(): void {
    this._handlers.onStopWithOnOff?.();
  }
}
