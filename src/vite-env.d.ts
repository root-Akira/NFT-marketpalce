/// <reference types="vite/client" />

interface Window {
  global: Window;
  Buffer: typeof Buffer;
  process: any;
}

declare global {
  interface Window {
    global: Window;
    Buffer: typeof Buffer;
    process: any;
  }
}
