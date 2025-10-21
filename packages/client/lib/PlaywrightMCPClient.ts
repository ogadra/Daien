import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
	type CallToolRequest,
	CallToolResultSchema,
	type ListToolsRequest,
	ListToolsResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
// Removed invalid import for objectOutputType

const mcpServerUrl = import.meta.env.VITE_MCP_SERVER_URL;
if (!mcpServerUrl) {
	throw new Error("VITE_MCP_SERVER_URL environment variable is required");
}

const transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
	sessionId: undefined,
});

const client = new Client({
	name: "daien",
	version: "0.0.1",
});

client.onerror = (error) => {
	console.error("Client error:", error);
};

export const initialize = async () => {
	await client.connect(transport);
};

export interface Tool {
	name: string;
	description?: string;
	inputSchema: {
		type: "object";
		properties?: Record<string, unknown> | undefined;
		required?: string[] | undefined;
	} & { [k: string]: unknown; }
	annotations?: {
		title?: string;
		readOnlyHint?: boolean;
		destructiveHint?: boolean;
		openWorldHint?: boolean;
	};
}

export const listTools = async (): Promise<Tool[]> => {
	const req: ListToolsRequest = {
		method: "tools/list",
		params: {},
	};
	// const res = await client.request(req, ListToolsResultSchema) as unknown as Tool[];
	const res = await client.request(req, ListToolsResultSchema);
	
	return res.tools;
};

export const callTool = async (
	toolName: string,
	arguments_: Record<string, any>,
): Promise<string> => {
	const req: CallToolRequest = {
		method: "tools/call",
		params: {
			name: toolName,
			arguments: arguments_,
		},
	};
	const res = await client.request(req, CallToolResultSchema);
	let contentText = "";

	res.content.forEach((item) => {
		if (item.type === "text") {
			console.log(item.text);
			contentText += item.text;
		} else {
			throw Error("Unsupported content type: " + item.type);
		}
	});
	return contentText;
};
