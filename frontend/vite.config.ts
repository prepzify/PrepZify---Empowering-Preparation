import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, ".", "") };
  const backendUrl = env.VITE_API_URL || "http://localhost:3000";

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    build: {
      target: "esnext",
      // Split vendor chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
            charts: ["recharts"],
            motion: ["motion"],
          },
        },
      },
    },

    optimizeDeps: {
      esbuildOptions: { target: "esnext" },
    },

    server: {
      port: 5173,
      hmr: true, // Enabled in standalone mode
      proxy: {
        // Proxy all /api/* requests to the Express backend in dev
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: 4173,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
