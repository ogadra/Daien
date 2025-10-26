import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
	type CallToolRequest,
	CallToolResultSchema,
	type ListToolsRequest,
	ListToolsResultSchema,
} from "@modelcontextprotocol/sdk/types.js";

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
	} & { [k: string]: unknown };
	annotations?: {
		title?: string;
		readOnlyHint?: boolean;
		destructiveHint?: boolean;
		openWorldHint?: boolean;
	};
}

export interface ImageContent {
	data: string;
	mimeType: string;
}

export interface ToolResponse {
	text: string;
	images: ImageContent[];
}

export interface ToolCallArgs {
	[k: string]: ToolCallArgs;
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
	arguments_: ToolCallArgs,
): Promise<ToolResponse> => {
	const req: CallToolRequest = {
		method: "tools/call",
		params: {
			name: toolName,
			arguments: arguments_,
		},
	};
	const res = await client.request(req, CallToolResultSchema);
	let contentText = "";
	const images: ImageContent[] = [];

	res.content.forEach((item) => {
		if (item.type === "text") {
			console.log(item.text);
			contentText += item.text;
		} else if (item.type === "image") {
			console.log("Image content received:", item);
			// Handle image content
			const imageData = item.data;
			const mimeType = item.mimeType || "image/png";

			images.push({
				data: imageData,
				mimeType,
			});

			// Add reference to image in text
			contentText += `\n\n[Image ${images.length}]${item.text ? `: ${item.text}` : ""}\n\n`;
		} else {
			console.warn(`Unsupported content type: ${item.type}`);
			contentText += `\n[Unsupported content type: ${item.type}]\n`;
		}
	});

	return {
		text: contentText,
		images,
	};
};
