import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { handleLocalApiRequest } from "./server/localApi";

const localApiPlugin = (env: Record<string, string>): Plugin => ({
  name: "local-api-plugin",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const handled = await handleLocalApiRequest(env, req, res);
      if (!handled) {
        next();
      }
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const handled = await handleLocalApiRequest(env, req, res);
      if (!handled) {
        next();
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), localApiPlugin(env), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
