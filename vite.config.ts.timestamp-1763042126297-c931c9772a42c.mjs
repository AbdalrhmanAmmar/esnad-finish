// vite.config.ts
import { defineConfig } from "file:///D:/mern%20esnad/Esnad-app/Esnad-Client/node_modules/vite/dist/node/index.js";
import react from "file:///D:/mern%20esnad/Esnad-app/Esnad-Client/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "D:\\mern esnad\\Esnad-app\\Esnad-Client";
var vite_config_default = defineConfig({
  base: "/",
  // تأكد من أن هذا "/" وليس "./"
  server: {
    host: "::",
    port: 1573
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // إيقاف الـ source maps إذا كانت تسبب مشاكل
    rollupOptions: {
      output: {
        // إضافة hash للأسماء للمساعدة في التخزين المؤقت
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxtZXJuIGVzbmFkXFxcXEVzbmFkLWFwcFxcXFxFc25hZC1DbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXG1lcm4gZXNuYWRcXFxcRXNuYWQtYXBwXFxcXEVzbmFkLUNsaWVudFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovbWVybiUyMGVzbmFkL0VzbmFkLWFwcC9Fc25hZC1DbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBiYXNlOiBcIi9cIiwgLy8gXHUwNjJBXHUwNjIzXHUwNjQzXHUwNjJGIFx1MDY0NVx1MDY0NiBcdTA2MjNcdTA2NDYgXHUwNjQ3XHUwNjMwXHUwNjI3IFwiL1wiIFx1MDY0OFx1MDY0NFx1MDY0QVx1MDYzMyBcIi4vXCJcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDE1NzMsXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgc291cmNlbWFwOiBmYWxzZSwgLy8gXHUwNjI1XHUwNjRBXHUwNjQyXHUwNjI3XHUwNjQxIFx1MDYyN1x1MDY0NFx1MDY0MCBzb3VyY2UgbWFwcyBcdTA2MjVcdTA2MzBcdTA2MjcgXHUwNjQzXHUwNjI3XHUwNjQ2XHUwNjJBIFx1MDYyQVx1MDYzM1x1MDYyOFx1MDYyOCBcdTA2NDVcdTA2MzRcdTA2MjdcdTA2NDNcdTA2NDRcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgLy8gXHUwNjI1XHUwNjM2XHUwNjI3XHUwNjQxXHUwNjI5IGhhc2ggXHUwNjQ0XHUwNjQ0XHUwNjIzXHUwNjMzXHUwNjQ1XHUwNjI3XHUwNjIxIFx1MDY0NFx1MDY0NFx1MDY0NVx1MDYzM1x1MDYyN1x1MDYzOVx1MDYyRlx1MDYyOSBcdTA2NDFcdTA2NEEgXHUwNjI3XHUwNjQ0XHUwNjJBXHUwNjJFXHUwNjMyXHUwNjRBXHUwNjQ2IFx1MDYyN1x1MDY0NFx1MDY0NVx1MDYyNFx1MDY0Mlx1MDYyQVxyXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF0nXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1MsU0FBUyxvQkFBb0I7QUFDclUsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUl6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUE7QUFBQSxFQUNOLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQSxRQUVOLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
