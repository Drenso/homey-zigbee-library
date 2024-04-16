import {
  AttributesDefinition,
  Cluster,
  ElectricalMeasurementCluster,
  ZCLDataTypes,
} from 'zigbee-clusters';

export class ExtendedElectricalMeasurementCluster extends ElectricalMeasurementCluster {
  static get ATTRIBUTES(): AttributesDefinition {
    return {...super.ATTRIBUTES, ...{
        rmsVoltagePhB: { id: 2309, type: ZCLDataTypes.uint16 },
        rmsCurrentPhB: { id: 2312, type: ZCLDataTypes.uint16 },
        activePowerPhB: { id: 2315, type: ZCLDataTypes.int16 },
        rmsVoltagePhC: { id: 2565, type: ZCLDataTypes.uint16 },
        rmsCurrentPhC: { id: 2568, type: ZCLDataTypes.uint16 },
        activePowerPhC: { id: 2571, type: ZCLDataTypes.int16 },
    }};
  }
}

Cluster.addCluster(ExtendedElectricalMeasurementCluster);
