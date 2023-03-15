import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability} from '../lib/attributeDevice';

const BATTERY_PERCENTAGE = 'batteryPercentageRemaining';

const CAPABILITY = 'measure_battery';
const CLUSTER_SPEC = CLUSTER.POWER_CONFIGURATION;

export default async function initPowerConfigurationDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
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
    device, zclNode, CAPABILITY, CLUSTER_SPEC, BATTERY_PERCENTAGE, reportParser, endpointId,
  );
}
