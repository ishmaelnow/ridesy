import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { VitePWA } from "vite-plugin-pwa";

// Renames dist-driver/index-driver.html → dist-driver/index.html
// so Netlify's "/* /index.html 200" redirect rule works correctly.
function renameDriverIndex(): Plugin {
  return {
    name: "rename-driver-index",
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist-driver");
      const src = path.join(outDir, "index-driver.html");
      const dest = path.join(outDir, "index.html");
      if (fs.existsSync(src)) fs.renameSync(src, dest);
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    renameDriverIndex(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
      manifest: {
        name: "RideApp Driver",
        short_name: "Driver",
        description: "Accept rides, track earnings, and manage your schedule",
        theme_color: "#0f1117",
        background_color: "#0f1117",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/driver",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-driver",
    rollupOptions: {
      input: "index-driver.html",
    },
  },
});
