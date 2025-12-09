import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 1573,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ⭐⭐⭐⭐⭐ هذا هو الأهم ⭐⭐⭐⭐⭐
  base: "/", // أو "./" إذا كنت على subdomain

  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild",
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],

    rollupOptions: {
      output: {
        manualChunks: undefined,
        // ⭐ أضف هذا الجزء ⭐
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
}));
