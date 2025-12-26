import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:3000/nova-admin-api/docs-json",
  output: "src/api",
  plugins: [
    {
      name: "@hey-api/client-axios",
      runtimeConfigPath: "../utils/request.ts",
    },
  ],
});
