import zbClusters, { type ColorControlClusterCommands } from 'zigbee-clusters';
import type {
  ExtendedColorControlClusterAttributes,
  ExtendedColorControlClusterCommands,
} from '../ExtendedColorControlCluster.mjs';
import type { BoundClusterPayloadFromDefinition } from '../../../types/BoundCluster.mjs';

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
      onMoveToHue?: (payload: MoveToHuePayload) => void;
      onMoveToSaturation?: (payload: MoveToSaturationPayload) => void;
      onMoveToHueAndSaturation?: (payload: MoveToHueAndSaturationPayload) => void;
      onMoveToColor?: (payload: MoveToColorPayload) => void;
      onMoveToColorTemperature?: (payload: MoveToColorTemperaturePayload) => void;
      onMoveHue?: (payload: MoveHuePayload) => void;
      stopMoveStep?: () => void;
      moveColorTemperature?: (payload: MoveColorTemperaturePayload) => void;
    },
  ) {
    super();
  }

  public moveToHue(payload: MoveToHuePayload): void {
    this._handlers.onMoveToHue?.(payload);
  }

  public moveToSaturation(payload: MoveToSaturationPayload): void {
    this._handlers.onMoveToSaturation?.(payload);
  }

  public moveToHueAndSaturation(payload: MoveToHueAndSaturationPayload): void {
    this._handlers.onMoveToHueAndSaturation?.(payload);
  }

  public moveToColor(payload: MoveToColorPayload): void {
    this._handlers.onMoveToColor?.(payload);
  }

  public moveToColorTemperature(payload: MoveToColorTemperaturePayload): void {
    this._handlers.onMoveToColorTemperature?.(payload);
  }

  public moveHue(payload: MoveHuePayload): void {
    this._handlers.onMoveHue?.(payload);
  }

  public stopMoveStep(): void {
    this._handlers.stopMoveStep?.();
  }

  public moveColorTemperature(payload: MoveColorTemperaturePayload): void {
    this._handlers.moveColorTemperature?.(payload);
  }
}
