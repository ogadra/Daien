import { useCallback, useEffect, useState } from "react";
import { callTool, initialize, listTools, type Tool } from "../lib/PlaywrightMCPClient";
import "./App.css";
import { Button, Code, HStack, Select, Textarea, VStack } from "@packages/ui";

const App = () => {
	const [toolName, setToolName] = useState<string>("browser_navigate");
	const [toolArgs, setToolArgs] = useState<string>(
		'{"url": "https://google.com"}',
	);
	const [result, setResult] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [tools, setTools] = useState<Tool[]>([]);

	const getTools = useCallback(async () => {
		try {
			const data = await listTools();
			setTools(data);
		} catch (error) {
			console.error("Error fetching tools:", error);
		}
	}, []);

	useEffect(() => {
		getTools();
	
		return () => void 0;
	}, [getTools]);

	const handleInitialize = async () => {
		setLoading(true);
		try {
			await initialize();
			await getTools();
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
		<div style={{ padding: "16px", width: "100%", margin: "0 auto" }}>
			<h1>Daien (代演)</h1>
			<h2>LLMの代わりに人力でMCPを呼び出す</h2>

			<div style={{ margin: "8px" }}>
				<Button
					color="black.950"
					onClick={handleInitialize}
					style={{ margin: "8px" }}
					loading={loading}
				>
					Initialize
				</Button>
			</div>
			<HStack align="start">
				<VStack width="50vw" align="center" justify="start">
				{tools.length > 0 && (
					<div style={{ margin: "4px" }}>
						<h3>Available Tools:</h3>
						<VStack style={{ margin: "8px" }}>
							<Select.Root
								placeholder="使用するツールを選びます"
							>
								{tools.map((tool) => (
									<Select.Option key={tool.name} value={tool.name}>
										{tool.name}
									</Select.Option>
								))}
							</Select.Root>
						</VStack>

						<VStack style={{ margin: "8px" }}>
							<label htmlFor="tool-args">
								Arguments (JSON):
							</label>
								<Textarea
								value={toolArgs}
								onChange={(e) => setToolArgs(e.target.value)}
								style={{ width: "100%", height: "80px" }}
							/>
						</VStack>

						<button
							type="button"
							onClick={handleCallTool}
							disabled={loading || !toolName}
						>
							Call Tool
						</button>
					</div>
				)}
				</VStack>
				<VStack width="50vw">
					<div style={{ margin: "4px" }}>
						<h3>Result</h3>
						{
							result && (
								<Code style={{ whiteSpace: "pre-wrap", textAlign: "left", overflowX: "scroll", width: "90%" }}>
									{loading ? "Loading..." : result}
								</Code>
							)
						}
						
					</div>
				</VStack>
			</HStack>
		</div>
	);
};

export default App;
