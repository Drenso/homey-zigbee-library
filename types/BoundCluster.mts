import type { types } from 'zigbee-clusters';

export type BoundClusterPayloadFromDefinition<Definition extends types.CommandDefinition> = {
  [arg in keyof Definition['args']]: types.FromZCLDataType<Definition['args'][arg]>;
};
