/**
 * Browser-based Playwright MCP Client
 *
 * Functional API for interacting with a Playwright MCP server
 * directly from the browser.
 */

type MCPRequest = {
	jsonrpc: string;
	id?: number;
	method: string;
	params: any;
};

type MCPResponse = {
	jsonrpc: string;
	id?: number;
	result?: any;
	error?: {
		code: number;
		message: string;
	};
};

type MCPClientState = {
	baseUrl: string;
	sessionId: string | null;
	requestId: number;
};

// Create initial state
const createMCPClient = (
	baseUrl = "http://localhost:8000",
): MCPClientState => ({
	baseUrl,
	sessionId: null,
	requestId: 1,
});

/**
 * Make an HTTP request to the MCP server
 */
const makeRequest = async (
	state: MCPClientState,
	data: MCPRequest,
	headers: Record<string, string> = {},
): Promise<{ data: MCPResponse; headers: Headers; state: MCPClientState }> => {
	const defaultHeaders = {
		"Content-Type": "application/json",
		Accept: "application/json, text/event-stream",
		...headers,
	};

	if (state.sessionId) {
		defaultHeaders["mcp-session-id"] = state.sessionId;
	}

	const response = await fetch("/api/mcp/", {
		method: "POST",
		headers: defaultHeaders,
		body: JSON.stringify(data),
	});
	console.log(response);

	// Extract session ID from response headers if available
	const responseSessionId = response.headers.get("mcp-session-id");
	const newState = {
		...state,
		sessionId: responseSessionId || state.sessionId,
		requestId: state.requestId + 1,
	};

	const responseText = await response.text();

	// Parse SSE response if needed (like in Node.js version)
	if (responseText.includes("event: message")) {
		const lines = responseText.split("\n");
		const dataLine = lines.find((line) => line.startsWith("data: "));
		if (dataLine) {
			try {
				const jsonData = JSON.parse(dataLine.substring(6));
				return { data: jsonData, headers: response.headers, state: newState };
			} catch (e) {
				// If JSON parsing fails, return raw response
				return {
					data: responseText as any,
					headers: response.headers,
					state: newState,
				};
			}
		} else {
			// No data line found, return raw response
			return {
				data: responseText as any,
				headers: response.headers,
				state: newState,
			};
		}
	} else {
		// Try to parse as regular JSON
		try {
			const jsonData = JSON.parse(responseText);
			return { data: jsonData, headers: response.headers, state: newState };
		} catch (e) {
			// If JSON parsing fails, return raw response
			return {
				data: responseText as any,
				headers: response.headers,
				state: newState,
			};
		}
	}
};

/**
 * Initialize the MCP connection
 */
export const initializeMCP = async (state: MCPClientState) => {
	const initRequest: MCPRequest = {
		jsonrpc: "2.0",
		id: state.requestId,
		method: "initialize",
		params: {
			protocolVersion: "2024-11-05",
			capabilities: {},
			clientInfo: {
				name: "browser-mcp-client",
				version: "1.0.0",
			},
		},
	};

	const { data, state: newState } = await makeRequest(state, initRequest);

	if (data.error) {
		throw new Error(`Initialization failed: ${data.error.message}`);
	}

	// Send initialized notification
	const notificationRequest: MCPRequest = {
		jsonrpc: "2.0",
		method: "notifications/initialized",
		params: {},
	};

	const { state: finalState } = await makeRequest(
		newState,
		notificationRequest,
	);

	return { result: data.result, state: finalState };
};

/**
 * Get list of available tools
 */
export const getTools = async (state: MCPClientState) => {
	const toolsRequest: MCPRequest = {
		jsonrpc: "2.0",
		id: state.requestId,
		method: "tools/list",
		params: {},
	};

	const { data, state: newState } = await makeRequest(state, toolsRequest);

	if (data.error) {
		throw new Error(`Failed to get tools: ${data.error.message}`);
	}

	return { tools: data.result.tools, state: newState };
};

/**
 * Call any tool by name with arguments
 */
export const callTool = async (
	state: MCPClientState,
	toolName: string,
	arguments_: any,
) => {
	const toolRequest: MCPRequest = {
		jsonrpc: "2.0",
		id: state.requestId,
		method: "tools/call",
		params: {
			name: toolName,
			arguments: arguments_,
		},
	};

	const { data, state: newState } = await makeRequest(state, toolRequest);

	if (data.error) {
		throw new Error(`Tool call failed: ${data.error.message}`);
	}

	return { result: data.result, state: newState };
};

// Export the client creator and types
export { createMCPClient };
export type { MCPClientState, MCPRequest, MCPResponse };
