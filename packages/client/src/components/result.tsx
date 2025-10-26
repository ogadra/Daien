import { VStack } from "@packages/ui";
import type { JSX } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ToolResponse } from "../../lib/types";

interface Props {
	result: ToolResponse[];
	loading: boolean;
}

export const Result = ({ result, loading }: Props): JSX.Element => {
	return (
		<VStack
			width="50%"
			align="center"
			justify="start"
			style={{ margin: "0 8px 0 2px" }}
		>
			<div style={{ width: "100%" }}>
				<h3>Result</h3>
				{result && (
					<div
						style={{
							textAlign: "left",
							overflowX: "scroll",
							width: "100%",
							backgroundColor: "#f6f8fa",
							borderRadius: "4px",
							padding: "12px",
						}}
					>
						{loading ? (
							"Loading..."
						) : (
							<>
								{result.map((result, index) => {
									switch (result.type) {
										case "text":
											return (
												<ReactMarkdown
													// biome-ignore lint/suspicious/noArrayIndexKey: Result items won't have stable ids.
													key={index}
													components={{
														code({ className, children }) {
															const match = /language-(\w+)/.exec(
																className || "",
															);
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
											);
										case "image":
											return (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: Result items won't have stable ids.
													key={index}
													style={{ marginTop: "16px" }}
												>
													{/* biome-ignore lint/a11y/useAltText: There is no meaningful text alternative on response images. */}
													<img
														src={`data:${result.mimeType};base64,${result.data}`}
														style={{
															maxWidth: "100%",
															height: "auto",
															border: "1px solid #ddd",
															borderRadius: "4px",
														}}
													/>
												</div>
											);
										default:
											return <>Unexpected result type</>;
									}
								})}

								{/* 画像が存在する場合 */}
							</>
						)}
					</div>
				)}
			</div>
		</VStack>
	);
};
