import zbClusters, {type LevelControlClusterCommands, type types} from 'zigbee-clusters';

type MoveToLevelPayload = types.FromZCLDataType<LevelControlClusterCommands['moveToLevel']['args']>;
type MovePayload = types.FromZCLDataType<LevelControlClusterCommands['move']['args']>;
type StepPayload = types.FromZCLDataType<LevelControlClusterCommands['step']['args']>;
type MoveToLevelWithOnOffPayload = types.FromZCLDataType<LevelControlClusterCommands['moveToLevelWithOnOff']['args']>;
type MoveWithOnOffPayload = types.FromZCLDataType<LevelControlClusterCommands['moveWithOnOff']['args']>;
type StepWithOnOffPayload = types.FromZCLDataType<LevelControlClusterCommands['stepWithOnOff']['args']>;

export default class LevelControlBoundCluster extends zbClusters.BoundCluster  {
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
