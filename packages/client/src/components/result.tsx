import { VStack } from "@packages/ui";
import type { JSX } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ToolResponse } from "../../lib/MCPClient";

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
										code({ className, children }) {
											const match = /language-(\w+)/.exec(className || "");
											if (!match) {
												return null;
											}
											return (
												<SyntaxHighlighter
													style={oneDark}
													language={match[1]}
													PreTag="div"
												>
													{String(children)}
												</SyntaxHighlighter>
											);
										},
									}}
								>
									{result.text}
								</ReactMarkdown>
								{/* 画像が存在する場合 */}
								{result.images.length > 0 && (
									<div style={{ marginTop: "16px" }}>
										{result.images.map((image, index) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: Response images won't have stable ids.
											<div key={index} style={{ marginBottom: "16px" }}>
												{/** biome-ignore lint/a11y/useAltText: There is no meaningful text alternative on response images. */}
												<img
													src={`data:${image.mimeType};base64,${image.data}`}
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
