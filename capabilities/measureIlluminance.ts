import {ZigBeeDevice} from 'homey-zigbeedriver';
import {CLUSTER, ZCLNode} from 'zigbee-clusters';
import {initReadOnlyCapability} from '../lib/attributeDevice';

export default async function initMeasureIlluminanceDevice(
  device: ZigBeeDevice,
  zclNode: ZCLNode,
  capabilityId = 'measure_luminance',
  endpointId?: number,
): Promise<void> {
  await initReadOnlyCapability(
    device,
    zclNode,
    capabilityId,
    CLUSTER.ILLUMINANCE_MEASUREMENT,
    'measuredValue',
    (value: number): number => {
      // MeasuredValue represents the Illuminance in Lux (symbol lx) as follows:
      // MeasuredValue = 10,000 x log10 Illuminance + 1
      return Math.round(10 ** ((value - 1) / 10000));
    },
    1000,
    undefined,
    endpointId,
  );
}
