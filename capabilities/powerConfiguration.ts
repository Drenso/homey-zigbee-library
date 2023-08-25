import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability} from '../lib/attributeDevice';

type ArgumentOverrides = {
  capabilityId: string,
  endpointId?: number,
}

export default async function initPowerConfigurationDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'measure_battery',
    endpointId,
  }: Partial<ArgumentOverrides> = {},
): Promise<void> {
  const reportParser = function (value: number): number | null {
    // Value comes from uint8
    if (value == 0xFF) return null;
    if (value < 0x00 || value > 0xFF) {
      device.error('Battery percentage value outside valid range');
      return null;
    }

    // Specifies the remaining battery life as a half integer percentage of the full battery capacity
    return Math.round(value / 2);
  };

  await initReadOnlyCapability(
    device,
    zclNode,
    capabilityId,
    CLUSTER.POWER_CONFIGURATION,
    'batteryPercentageRemaining',
    reportParser,
    endpointId,
  );
}
