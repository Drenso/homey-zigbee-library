import { ZigBeeDevice } from 'homey-zigbeedriver';

export function triggerFlowWithLog(
  device: ZigBeeDevice,
  flowId: string,
  tokens?: Record<string, unknown>,
  state?: Record<string, unknown>,
): Promise<void> {
  device.log('Triggering flow', flowId, JSON.stringify(tokens), JSON.stringify(state));

  return device
    .triggerFlow({
      id: flowId,
      tokens,
      state,
    })
    .catch(device.error);
}
