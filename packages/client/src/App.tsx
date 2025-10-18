import { useState } from "react";
import { callTool, initialize, listTools } from "../lib/PlaywrightMCPClient";
import "./App.css";

const App = () => {
	const [mcpSessionId, setMcpSessionId] = useState<string | null>(null);

	const [toolName, setToolName] = useState<string>("browser_navigate");
	const [toolArgs, setToolArgs] = useState<string>(
		'{"url": "https://google.com"}',
	);
	const [result, setResult] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [tools, setTools] = useState<any[]>([]);

	const handleInitialize = async () => {
		setLoading(true);
		try {
			await initialize();
			const data = await listTools();
			setTools(data.tools);
			setMcpSessionId(mcpSessionId);
		} catch (error) {
			setResult(
				`Error: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
		setLoading(false);
	};

	const handleCallTool = async () => {
		if (!toolName) return;
		setLoading(true);
		try {
			let args = {};
			try {
				args = toolArgs ? JSON.parse(toolArgs) : {};
			} catch {
				args = {};
			}

			const data = await callTool(toolName, args);
			setResult(data);
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
				<button type="button" onClick={handleInitialize} disabled={loading}>
					Initialize
				</button>
			</div>

			{tools.length > 0 && (
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
};

export default App;
