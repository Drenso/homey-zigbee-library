import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability} from '../lib/attributeDevice';

export default async function initPowerConfigurationDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId = 'measure_battery',
  endpointId?: number,
): Promise<void> {
  const reportParser = function (value: number): number | null {
    device.debug('New battery percentage', value);

    // Max value 200, 255 indicates invalid or unknown reading
    if (value <= 200 && value !== 255) {
      return Math.round(value / 2);
    }
    return null;
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
