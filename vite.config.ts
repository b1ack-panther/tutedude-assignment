import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import mediaPipePlugin from "./mediapipe-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	server: {
		host: "::",
		port: 8080,
	},
	plugins: [react(), mode === "development" && componentTagger()].filter(
		Boolean
	),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		commonjsOptions: {
			transformMixedEsModules: true,
			include: [/node_modules/, /fcmv2/],
			exclude: ["mediaPipePlugin.ts"],
			extensions: [".js", ".cjs", ".jsx"],
		},
		rollupOptions: {
			plugins: [mediaPipePlugin()],
		},
	},
}));
