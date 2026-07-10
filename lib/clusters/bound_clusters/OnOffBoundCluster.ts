import zbClusters from 'zigbee-clusters';

export default class OnOffBoundCluster extends zbClusters.BoundCluster  {
  public constructor(
    private _handlers: {
      onSetOn?: () => void;
      onSetOff?: () => void;
      onToggle?: () => void;
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
}
