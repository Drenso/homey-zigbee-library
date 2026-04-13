import tseslint from 'typescript-eslint';
import drensoConfig from '@drenso/eslint-config-homey-mts';

export default tseslint.config(
  {
    ignores: ['**/*.d.mts']
  },
  ...drensoConfig
);
