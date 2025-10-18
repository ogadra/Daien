import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema, ListToolsResultSchema, type CallToolRequest, type ListToolsRequest } from "@modelcontextprotocol/sdk/types.js";

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3001/mcp"),
  {
    sessionId: undefined,
  }
);
 
const client = new Client({
  name: "daien",
  version: "0.0.1",
});
 
client.onerror = (error) => {
  console.error("Client error:", error);
};

 
export const initialize = async () => {
	await client.connect(transport);
}

export const listTools = async () => {
	const req: ListToolsRequest = {
		method: "tools/list",
		params: {},
	};
	const res = await client.request(req, ListToolsResultSchema);
	return res;
}
 
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
			contentText += item.text;
		} else {
			throw Error("Unsupported content type: " + item.type);
		}
	});
	return contentText;
}
