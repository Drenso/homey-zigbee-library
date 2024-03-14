import {BoundCluster} from 'zigbee-clusters';

type OnOffType = () => void;

export default class OnOffBoundCluster extends BoundCluster {
  private readonly _onSetOn ?: OnOffType;
  private readonly _onSetOff ?: OnOffType;
  private readonly _onToggle ?: OnOffType;

  constructor(onSetOn?: OnOffType, onSetOff?: OnOffType, onToggle?: OnOffType) {
    super();
    this._onSetOn = onSetOn;
    this._onSetOff = onSetOff;
    this._onToggle = onToggle;
  }

  setOn(): void {
    if (this._onSetOn) {
      this._onSetOn();
    }

    if (this._onToggle) {
      this._onToggle();
    }
  }

  setOff(): void {
    if (this._onSetOff) {
      this._onSetOff();
    }

    if (this._onToggle) {
      this._onToggle();
    }
  }
}
