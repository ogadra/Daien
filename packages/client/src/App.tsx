import { Button, Heading, HStack, VStack } from "@packages/ui";
import { type JSX, useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
	initialize,
	listTools,
	type Tool,
	type ToolResponse,
} from "../lib/PlaywrightMCPClient";
import { DisplayTools } from "./components/displayTools";

const App = (): JSX.Element => {
	const [useToolName, setUseToolName] = useState<string>("browser_navigate");

	const [result, setResult] = useState<ToolResponse | null>(null);
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

	const handleInitialize = async () => {
		setLoading(true);
		try {
			await initialize();
			await getTools();
		} catch (error) {
			setResult({
				text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
				images: [],
			});
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
			<Heading as="h1" style={{ fontSize: "3rem" }}>
				Daien (代演)
			</Heading>
			<Heading as="h2" style={{ fontSize: "1rem", fontWeight: "normal" }}>
				LLMの代わりに人力でMCPを呼び出す
			</Heading>

			<Button
				onClick={handleInitialize}
				loading={loading}
				style={{ margin: "16px" }}
			>
				Initialize
			</Button>

			<HStack align="start">
				<DisplayTools
					tools={tools}
					useToolName={useToolName}
					setUseToolName={setUseToolName}
					loading={loading}
					setLoading={setLoading}
					setResult={setResult}
				/>
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
									<>
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
											{result.text}
										</ReactMarkdown>
										{result.images && result.images.length > 0 && (
											<div style={{ marginTop: "16px" }}>
												{result.images.map((image, index) => (
													// biome-ignore lint/suspicious/noArrayIndexKey: tmporary
													<div key={index} style={{ marginBottom: "16px" }}>
														{image.text && (
															<p
																style={{
																	margin: "0 0 8px 0",
																	fontStyle: "italic",
																}}
															>
																{image.text}
															</p>
														)}
														<img
															src={`data:${image.mimeType};base64,${image.data}`}
															alt={image.text || `Image ${index + 1}`}
															style={{
																maxWidth: "100%",
																height: "auto",
																border: "1px solid #ddd",
																borderRadius: "4px",
															}}
														/>
													</div>
												))}
											</div>
										)}
									</>
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
