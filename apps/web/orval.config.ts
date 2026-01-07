import { defineConfig } from 'orval';

export default defineConfig({
  novaAdmin: {
    input: {
      target: 'http://localhost:3000/api-docs-json',
    },
    output: {
      mode: 'single',
      target: './src/api/generated/index.ts',
      client: 'axios',
      baseUrl: 'http://localhost:3000/api',
      override: {
        mutator: {
          path: './src/api/request.ts',
          name: 'request',
        },
      },
      prettier: true,
      tsconfig: './tsconfig.json',
      clean: true,
    },
  },
});
