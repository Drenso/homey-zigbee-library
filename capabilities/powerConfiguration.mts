import {ZigBeeDevice} from 'homey-zigbeedriver';
import zbClusters, {type ZCLNode} from 'zigbee-clusters';
import {
  DefaultConfiguration,
  initReadOnlyCapability,
  ReportingConfiguration,
} from '../lib/attributeDevice.mjs';

type ArgumentOverrides = DefaultConfiguration & ReportingConfiguration;

export default async function initPowerConfigurationDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  {
    capabilityId = 'measure_battery',
    minChange = 2,
    minInterval,
    maxInterval,
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
    zbClusters.CLUSTER.POWER_CONFIGURATION,
    'batteryPercentageRemaining',
    reportParser,
    {minInterval, maxInterval, minChange},
    endpointId,
  );
}
