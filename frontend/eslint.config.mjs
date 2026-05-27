import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      // Data-fetching effects legitimately call setState in callbacks and on
      // initial trigger — disable overly strict rule for async fetch pattern.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])

export default eslintConfig
