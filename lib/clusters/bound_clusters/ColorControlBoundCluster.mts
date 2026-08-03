import zbClusters, { type ColorControlClusterCommands } from 'zigbee-clusters';
import type {
  ExtendedColorControlClusterAttributes,
  ExtendedColorControlClusterCommands,
} from '../ExtendedColorControlCluster.mjs';
import type { BoundClusterPayloadFromDefinition } from '../../../types/BoundCluster.mjs';
import type {BoundClusterMeta} from './BoundClusterMeta.mjs';

export type MoveToHuePayload = BoundClusterPayloadFromDefinition<ColorControlClusterCommands['moveToHue']>;
export type MoveToSaturationPayload = BoundClusterPayloadFromDefinition<
  ColorControlClusterCommands['moveToSaturation']
>;
export type MoveToHueAndSaturationPayload = BoundClusterPayloadFromDefinition<
  ColorControlClusterCommands['moveToHueAndSaturation']
>;
export type MoveToColorPayload = BoundClusterPayloadFromDefinition<ColorControlClusterCommands['moveToColor']>;
export type MoveToColorTemperaturePayload = BoundClusterPayloadFromDefinition<
  ColorControlClusterCommands['moveToColorTemperature']
>;
export type MoveHuePayload = BoundClusterPayloadFromDefinition<ExtendedColorControlClusterCommands['moveHue']>;
export type MoveColorTemperaturePayload = BoundClusterPayloadFromDefinition<
  ExtendedColorControlClusterCommands['moveColorTemperature']
>;

export default class ColorControlBoundCluster extends zbClusters.BoundCluster<
  ExtendedColorControlClusterAttributes,
  ExtendedColorControlClusterCommands
> {
  public constructor(
    private _handlers: {
      onMoveToHue?: (payload: MoveToHuePayload, meta: BoundClusterMeta) => void;
      onMoveToSaturation?: (payload: MoveToSaturationPayload, meta: BoundClusterMeta) => void;
      onMoveToHueAndSaturation?: (payload: MoveToHueAndSaturationPayload, meta: BoundClusterMeta) => void;
      onMoveToColor?: (payload: MoveToColorPayload, meta: BoundClusterMeta) => void;
      onMoveToColorTemperature?: (payload: MoveToColorTemperaturePayload,meta: BoundClusterMeta) => void;
      onMoveHue?: (payload: MoveHuePayload, meta: BoundClusterMeta) => void;
      stopMoveStep?: (meta: BoundClusterMeta) => void;
      moveColorTemperature?: (payload: MoveColorTemperaturePayload, meta: BoundClusterMeta) => void;
    },
  ) {
    super();
  }

  public moveToHue(payload: MoveToHuePayload, meta: BoundClusterMeta): void {
    this._handlers.onMoveToHue?.(payload, meta);
  }

  public moveToSaturation(payload: MoveToSaturationPayload, meta: BoundClusterMeta): void {
    this._handlers.onMoveToSaturation?.(payload, meta);
  }

  public moveToHueAndSaturation(payload: MoveToHueAndSaturationPayload, meta: BoundClusterMeta): void {
    this._handlers.onMoveToHueAndSaturation?.(payload, meta);
  }

  public moveToColor(payload: MoveToColorPayload, meta: BoundClusterMeta): void {
    this._handlers.onMoveToColor?.(payload, meta);
  }

  public moveToColorTemperature(payload: MoveToColorTemperaturePayload, meta: BoundClusterMeta): void {
    this._handlers.onMoveToColorTemperature?.(payload, meta);
  }

  public moveHue(payload: MoveHuePayload, meta: BoundClusterMeta): void {
    this._handlers.onMoveHue?.(payload, meta);
  }

  public stopMoveStep(meta: BoundClusterMeta): void {
    this._handlers.stopMoveStep?.(meta);
  }

  public moveColorTemperature(payload: MoveColorTemperaturePayload, meta: BoundClusterMeta): void {
    this._handlers.moveColorTemperature?.(payload, meta);
  }
}
