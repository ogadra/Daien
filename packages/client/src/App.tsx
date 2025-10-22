import { useCallback, useEffect, useState } from "react";
import {
	callTool,
	initialize,
	listTools,
	type Tool,
} from "../lib/PlaywrightMCPClient";
import "./App.css";
import { Button, HStack, Select, Textarea, VStack } from "@packages/ui";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
		<div
			style={{
				padding: "16px",
				width: "100%",
				margin: "0 auto",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				minHeight: "100vh",
			}}
		>
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
									placeholder="使用するツール"
									value={toolName}
									onChange={(value) => setToolName(value)}
								>
									{tools.map((tool) => (
										<Select.Option key={tool.name} value={tool.name}>
											{tool.name}
										</Select.Option>
									))}
								</Select.Root>
							</VStack>

							{toolName && (
								<>
									<h4>Selected Tool: {toolName}</h4>
									{(() => {
										const selectedTool = tools.find(
											(tool) => tool.name === toolName,
										);
										if (!selectedTool) return null;

										const renderValue = (
											value: any,
											depth = 0,
										): React.ReactNode => {
											const indent = "  ".repeat(depth);

											if (value === null)
												return <span style={{ color: "#999" }}>null</span>;
											if (value === undefined)
												return <span style={{ color: "#999" }}>undefined</span>;
											if (typeof value === "string")
												return (
													<span style={{ color: "#0c7b2e" }}>"{value}"</span>
												);
											if (typeof value === "number")
												return (
													<span style={{ color: "#0366d6" }}>{value}</span>
												);
											if (typeof value === "boolean")
												return (
													<span style={{ color: "#e3116c" }}>
														{value.toString()}
													</span>
												);

											if (Array.isArray(value)) {
												if (value.length === 0) return <span>[]</span>;
												return (
													<>
														<span>[</span>
														{value.map((item, index) => (
															// biome-ignore lint/suspicious/noArrayIndexKey: tmporary
															<div key={index} style={{ whiteSpace: "pre" }}>
																{indent} {renderValue(item, depth + 1)}
																{index < value.length - 1 && <span>,</span>}
															</div>
														))}
														<span style={{ whiteSpace: "pre" }}>{indent}]</span>
													</>
												);
											}

											if (typeof value === "object") {
												const entries = Object.entries(value);
												if (entries.length === 0) return <span>{"{}"}</span>;
												return (
													<>
														<span>{"{"}</span>
														{entries.map(([key, val], index) => (
															<div key={key} style={{ whiteSpace: "pre" }}>
																{indent}{" "}
																<span style={{ color: "#6f42c1" }}>
																	"{key}"
																</span>
																: {renderValue(val, depth + 1)}
																{index < entries.length - 1 && <span>,</span>}
															</div>
														))}
														<span style={{ whiteSpace: "pre" }}>
															{indent}
															{"}"}
														</span>
													</>
												);
											}

											return <span>{String(value)}</span>;
										};

										return (
											<div
												style={{
													margin: "8px",
													padding: "12px",
													backgroundColor: "#f6f8fa",
													borderRadius: "4px",
													fontFamily: "monospace",
													fontSize: "14px",
													textAlign: "left",
													maxWidth: "40vw",
													overflowX: "scroll",
												}}
											>
												{renderValue(selectedTool)}
											</div>
										);
									})()}
								</>
							)}

							<VStack style={{ margin: "8px" }}>
								<label htmlFor="tool-args">Arguments (JSON):</label>
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
						{result && (
							<div
								style={{
									textAlign: "left",
									overflowX: "scroll",
									width: "90%",
									backgroundColor: "#f6f8fa",
									borderRadius: "4px",
									padding: "12px",
								}}
							>
								{loading ? (
									"Loading..."
								) : (
									<ReactMarkdown
										components={{
											code({ node, inline, className, children, ...props }) {
												const match = /language-(\w+)/.exec(className || "");
												return !inline && match ? (
													<SyntaxHighlighter
														style={oneDark}
														language={match[1]}
														PreTag="div"
														{...props}
													>
														{String(children).replace(/\n$/, "")}
													</SyntaxHighlighter>
												) : (
													<code
														{...props}
														style={{
															backgroundColor: "#e1e4e8",
															padding: "2px 4px",
															borderRadius: "3px",
															fontFamily: "monospace",
														}}
													>
														{children}
													</code>
												);
											},
										}}
									>
										{result}
									</ReactMarkdown>
								)}
							</div>
						)}
					</div>
				</VStack>
			</HStack>
		</div>
	);
};

export default App;
