import type {
  ElectricalMeasurementClusterAttributes,
  ElectricalMeasurementClusterCommands,
  types,
} from 'zigbee-clusters';
import zbClusters from 'zigbee-clusters';

export const extendedAttributes = {
  totalActivePower: { id: 0x0304, type: zbClusters.ZCLDataTypes.int32 },
  powerMultiplier: { id: 0x0402, type: zbClusters.ZCLDataTypes.uint32 },
  powerDivisor: { id: 0x0403, type: zbClusters.ZCLDataTypes.uint32 },
  rmsVoltagePhB: { id: 0x0905, type: zbClusters.ZCLDataTypes.uint16 },
  rmsCurrentPhB: { id: 0x0908, type: zbClusters.ZCLDataTypes.uint16 },
  activePowerPhB: { id: 0x090b, type: zbClusters.ZCLDataTypes.int16 },
  rmsVoltagePhC: { id: 0x0a05, type: zbClusters.ZCLDataTypes.uint16 },
  rmsCurrentPhC: { id: 0x0a08, type: zbClusters.ZCLDataTypes.uint16 },
  activePowerPhC: { id: 0x0a0b, type: zbClusters.ZCLDataTypes.int16 },
} as const satisfies types.AttributeDefinitions;

type ExtendedElectricalMeasurementClusterAttributes = ElectricalMeasurementClusterAttributes &
  typeof extendedAttributes;

export class ExtendedElectricalMeasurementCluster<
  Attributes extends types.AttributeDefinitions = ExtendedElectricalMeasurementClusterAttributes,
  Commands extends types.CommandDefinitions = ElectricalMeasurementClusterCommands,
> extends zbClusters.ElectricalMeasurementCluster<Attributes, Commands> {
  public static get ATTRIBUTES(): types.AttributeDefinitions {
    return {
      ...super.ATTRIBUTES,
      ...extendedAttributes,
    };
  }
}

zbClusters.Cluster.addCluster(ExtendedElectricalMeasurementCluster);
