import type { AttributesDefinition } from 'zigbee-clusters';
import { Cluster, ElectricalMeasurementCluster, ZCLDataTypes } from 'zigbee-clusters';

export class ExtendedElectricalMeasurementCluster extends ElectricalMeasurementCluster {
  public static get ATTRIBUTES(): AttributesDefinition {
    // todo: remove "as Record<string, unknown>"
    return {
      ...(super.ATTRIBUTES as Record<string, unknown>),
      ...{
        totalActivePower: { id: 0x0304, type: ZCLDataTypes.int32 },
        powerMultiplier: { id: 0x0402, type: ZCLDataTypes.uint32 },
        powerDivisor: { id: 0x0403, type: ZCLDataTypes.uint32 },
        rmsVoltagePhB: { id: 0x0905, type: ZCLDataTypes.uint16 },
        rmsCurrentPhB: { id: 0x0908, type: ZCLDataTypes.uint16 },
        activePowerPhB: { id: 0x090b, type: ZCLDataTypes.int16 },
        rmsVoltagePhC: { id: 0x0a05, type: ZCLDataTypes.uint16 },
        rmsCurrentPhC: { id: 0x0a08, type: ZCLDataTypes.uint16 },
        activePowerPhC: { id: 0x0a0b, type: ZCLDataTypes.int16 },
      },
    };
  }
}

// todo: remove "as unknown as typeof Cluster"
Cluster.addCluster(ExtendedElectricalMeasurementCluster as unknown as typeof Cluster);
