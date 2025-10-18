import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api/mcp": {
				target: (() => {
					const target = process.env.VITE_PROXY_TARGET_URL;
					if (!target) {
						throw new Error("VITE_PROXY_TARGET_URL environment variable is required");
					}
					return target;
				})(),
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/mcp/, "/mcp"),
				headers: {
					Connection: "keep-alive",
				},
				timeout: 60000,
			},
		},
	},
});
