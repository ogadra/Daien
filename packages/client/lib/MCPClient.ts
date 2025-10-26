import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export class MCPClient extends Client {
	constructor() {
		super({
			name: "daien",
			version: "0.0.1",
		});
	}

	async initialize() {
		const mcpServerUrl = import.meta.env.VITE_MCP_SERVER_URL;
		if (!mcpServerUrl) {
			throw new Error("VITE_MCP_SERVER_URL environment variable is required");
		}

		const transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
			sessionId: undefined,
		});
		await this.connect(transport);
	}
}
