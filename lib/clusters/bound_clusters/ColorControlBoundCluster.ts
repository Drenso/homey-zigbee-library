import zbClusters, { type ColorControlClusterCommands, type types } from 'zigbee-clusters';
import type { ExtendedColorControlClusterCommands } from '../ExtendedColorControlCluster.js';

export type MoveToHuePayload = types.FromZCLDataType<ColorControlClusterCommands['moveToHue']['args']>;
export type MoveToSaturationPayload = types.FromZCLDataType<ColorControlClusterCommands['moveToSaturation']['args']>;
export type MoveToHueAndSaturationPayload = types.FromZCLDataType<
  ColorControlClusterCommands['moveToHueAndSaturation']['args']
>;
export type MoveToColorPayload = types.FromZCLDataType<ColorControlClusterCommands['moveToColor']['args']>;
export type MoveToColorTemperaturePayload = types.FromZCLDataType<
  ColorControlClusterCommands['moveToColorTemperature']['args']
>;
export type MoveHuePayload = types.FromZCLDataType<ExtendedColorControlClusterCommands['moveHue']['args']>;
export type MoveColorTemperaturePayload = types.FromZCLDataType<
  ExtendedColorControlClusterCommands['moveColorTemperature']['args']
>;

export default class ColorControlBoundCluster extends zbClusters.BoundCluster {
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
