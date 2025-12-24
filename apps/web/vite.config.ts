import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
// 新增：静态复制插件，用于在构建时将根目录的 README.md 复制到输出目录
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  build: {
    sourcemap: "hidden",
    outDir: "nova-admin",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    // 在构建阶段复制 README.md 到输出目录根
    viteStaticCopy({
      targets: [
        {
          src: "README.md", // 源文件：项目根目录的 README.md
          dest: "", // 目标：输出目录根（即 nova-admin/）
        },
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // 可以在这里定义全局Less变量
        },
      },
    },
    modules: {
      // CSS模块配置
      localsConvention: "camelCase",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
});
