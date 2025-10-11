import { useState } from "react";
import type { MCPClientState } from "../lib/PlaywrightMCPClient";
import {
	callTool,
	createMCPClient,
	getTools,
	initializeMCP,
} from "../lib/PlaywrightMCPClient";
import "./App.css";

function App() {
	const [mcpState, setMCPState] = useState<MCPClientState | null>(null);
	const [baseUrl, setBaseUrl] = useState("");
	const [toolName, setToolName] = useState("");
	const [toolArgs, setToolArgs] = useState("");
	const [result, setResult] = useState("");
	const [loading, setLoading] = useState(false);
	const [tools, setTools] = useState<any[]>([]);

	const handleInitialize = async () => {
		setLoading(true);
		try {
			const client = createMCPClient(baseUrl);
			const { result: initResult, state } = await initializeMCP(client);
			setMCPState(state);
			setResult(`Initialized: ${JSON.stringify(initResult, null, 2)}`);

			// Get available tools
			const { tools: availableTools, state: newState } = await getTools(state);
			setTools(availableTools);
			setMCPState(newState);
		} catch (error) {
			setResult(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
		setLoading(false);
	};

	const handleCallTool = async () => {
		if (!mcpState || !toolName) return;

		setLoading(true);
		try {
			let args = {};
			try {
				args = toolArgs ? JSON.parse(toolArgs) : {};
			} catch {
				args = {};
			}

			const { result: toolResult, state } = await callTool(
				mcpState,
				toolName,
				args,
			);
			setMCPState(state);
			setResult(JSON.stringify(toolResult, null, 2));
		} catch (error) {
			setResult(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
		setLoading(false);
	};

	return (
		<div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
			<h1>Playwright MCP Client</h1>

			<div style={{ marginBottom: "20px" }}>
				<label>
					MCP Server URL:
					<input
						type="text"
						value={baseUrl}
						onChange={(e) => setBaseUrl(e.target.value)}
						style={{ marginLeft: "10px", width: "300px" }}
					/>
				</label>
				<button type="button" onClick={handleInitialize} disabled={loading}>
					Initialize
				</button>
			</div>

			{mcpState && (
				<>
					<div style={{ marginBottom: "20px" }}>
						<h3>Available Tools:</h3>
						<select
							value={toolName}
							onChange={(e) => setToolName(e.target.value)}
							style={{ marginBottom: "10px", width: "300px" }}
						>
							<option value="">Select a tool...</option>
							{tools.map((tool) => (
								<option key={tool.name} value={tool.name}>
									{tool.name} - {tool.description}
								</option>
							))}
						</select>

						<div style={{ marginBottom: "10px" }}>
							<label>
								Tool Name:
								<input
									type="text"
									value={toolName}
									onChange={(e) => setToolName(e.target.value)}
									placeholder="e.g., browser_click"
									style={{ marginLeft: "10px", width: "300px" }}
								/>
							</label>
						</div>

						<div style={{ marginBottom: "10px" }}>
							<label>
								Arguments (JSON):
								<textarea
									value={toolArgs}
									onChange={(e) => setToolArgs(e.target.value)}
									placeholder='{"element": "button", "ref": "e1"}'
									style={{ marginLeft: "10px", width: "300px", height: "80px" }}
								/>
							</label>
						</div>

						<button
							type="button"
							onClick={handleCallTool}
							disabled={loading || !toolName}
						>
							Call Tool
						</button>
					</div>
				</>
			)}

			<div style={{ marginTop: "20px" }}>
				<h3>Result:</h3>
				<pre
					style={{
						background: "#f5f5f5",
						padding: "10px",
						border: "1px solid #ddd",
						maxHeight: "400px",
						overflow: "auto",
					}}
				>
					{loading ? "Loading..." : result}
				</pre>
			</div>
		</div>
	);
}

export default App;
