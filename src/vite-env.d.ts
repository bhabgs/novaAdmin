/// <reference types="vite/client" />

// 扩展全局 Window 类型，便于开发环境调试使用
declare global {
  interface Window {
    __REDUX_STORE__?: unknown; // 仅用于开发调试，不参与业务逻辑
  }
}