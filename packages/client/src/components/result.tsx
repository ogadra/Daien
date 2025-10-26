import { VStack } from "@packages/ui";
import type { JSX } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ToolResponse } from "../../lib/PlaywrightMCPClient";

interface Props {
	result: ToolResponse | null;
	loading: boolean;
}

export const Result = ({ result, loading }: Props): JSX.Element => {
	return (
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
	);
};
