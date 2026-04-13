import type { AttributesDefinition } from 'zigbee-clusters';
import zbClusters from 'zigbee-clusters';

export class ExtendedElectricalMeasurementCluster extends zbClusters.ElectricalMeasurementCluster {
  public static get ATTRIBUTES(): AttributesDefinition {
    // todo: remove "as Record<string, unknown>"
    return {
      ...(super.ATTRIBUTES as Record<string, unknown>),
      ...{
        totalActivePower: { id: 0x0304, type: zbClusters.ZCLDataTypes.int32 },
        powerMultiplier: { id: 0x0402, type: zbClusters.ZCLDataTypes.uint32 },
        powerDivisor: { id: 0x0403, type: zbClusters.ZCLDataTypes.uint32 },
        rmsVoltagePhB: { id: 0x0905, type: zbClusters.ZCLDataTypes.uint16 },
        rmsCurrentPhB: { id: 0x0908, type: zbClusters.ZCLDataTypes.uint16 },
        activePowerPhB: { id: 0x090b, type: zbClusters.ZCLDataTypes.int16 },
        rmsVoltagePhC: { id: 0x0a05, type: zbClusters.ZCLDataTypes.uint16 },
        rmsCurrentPhC: { id: 0x0a08, type: zbClusters.ZCLDataTypes.uint16 },
        activePowerPhC: { id: 0x0a0b, type: zbClusters.ZCLDataTypes.int16 },
      },
    };
  }
}

// todo: remove "as unknown as typeof Cluster"
zbClusters.Cluster.addCluster(ExtendedElectricalMeasurementCluster as unknown as typeof zbClusters.Cluster);
