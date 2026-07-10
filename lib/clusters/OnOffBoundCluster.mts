import zbClusters from 'zigbee-clusters';

type OnOffType = () => void;

/** @deprecated Use OnOffBoundCluster from bound_clusters instead */
export default class OnOffBoundCluster extends zbClusters.BoundCluster {
  private readonly _onSetOn?: OnOffType;
  private readonly _onSetOff?: OnOffType;
  private readonly _onToggle?: OnOffType;

  public constructor(onSetOn?: OnOffType, onSetOff?: OnOffType, onToggle?: OnOffType) {
    super();
    this._onSetOn = onSetOn;
    this._onSetOff = onSetOff;
    this._onToggle = onToggle;
  }

  public setOn(): void {
    if (this._onSetOn) {
      this._onSetOn();
    }

    if (this._onToggle) {
      this._onToggle();
    }
  }

  public setOff(): void {
    if (this._onSetOff) {
      this._onSetOff();
    }

    if (this._onToggle) {
      this._onToggle();
    }
  }
}
