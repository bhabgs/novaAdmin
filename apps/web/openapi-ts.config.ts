import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-axios',
  input: 'http://localhost:3000/api/docs-json',
  output: {
    path: './src/api/generated',
    format: 'prettier',
  },
  types: {
    enums: 'javascript',
  },
  plugins: [],
});
