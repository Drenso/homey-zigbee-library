import {BoundCluster} from 'zigbee-clusters';

type MoveType = (direction: 'up' | 'down') => void;
type StopType = () => void;

export default class LevelControlBoundCluster extends BoundCluster {
  private readonly _onMove?: MoveType;
  private readonly _onStop?: StopType;

  constructor(_onMove?: MoveType, _onStop?: StopType) {
    super();
    this._onMove = _onMove;
    this._onStop = _onStop;
  }

  move(): void {
    if (this._onMove) {
      this._onMove('down');
    }
  }

  stop(): void {
    if (this._onStop) {
      this._onStop();
    }
  }

  moveWithOnOff(): void {
    if (this._onMove) {
      this._onMove('up');
    }
  }
}
