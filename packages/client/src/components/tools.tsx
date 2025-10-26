import { Button, Select, Textarea, VStack } from "@packages/ui";
import {
	type Dispatch,
	type JSX,
	type SetStateAction,
	useId,
	useRef,
} from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { MCPClient } from "../../lib/MCPClient";
import type { Tool, ToolCallArgs, ToolResponse } from "../../lib/types";

interface Props {
	tools: Tool[];
	useToolName: string;
	setUseToolName: Dispatch<SetStateAction<string>>;
	loading: boolean;
	setLoading: Dispatch<SetStateAction<boolean>>;
	setResult: Dispatch<SetStateAction<ToolResponse[]>>;
	client: MCPClient;
}

const parseJSONToToolCallArgs = (str?: string): ToolCallArgs => {
	if (!str) return {};
	try {
		return JSON.parse(str);
	} catch {
		return {};
	}
};

export const Tools = ({
	tools,
	useToolName,
	setUseToolName,
	loading,
	setLoading,
	setResult,
	client,
}: Props): JSX.Element => {
	const argsRef = useRef<HTMLTextAreaElement | null>(null);
	const textAreaId = useId();

	const handleCallTool = async () => {
		if (!useToolName) return;
		setLoading(true);

		const toolArgs = argsRef.current?.value;
		try {
			const data = await client.callTool({
				name: useToolName,
				arguments: parseJSONToToolCallArgs(toolArgs),
			});
			const content = data.content as ToolResponse[];
			if (!content) return;

			setResult(content);
		} catch (error) {
			setResult([
				{
					type: "text",
					text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
				},
			]);
		}
		setLoading(false);
	};

	return (
		<VStack
			width="50%"
			align="center"
			justify="start"
			style={{ margin: "0 2px 0 8px" }}
		>
			<div style={{ width: "100%" }}>
				<h3>Available Tools:</h3>
				<VStack style={{ marginBottom: "8px" }}>
					<Select.Root
						value={useToolName}
						onChange={(value) => setUseToolName(value)}
					>
						{tools.map((tool) => (
							<Select.Option key={tool.name} value={tool.name}>
								{tool.name}
							</Select.Option>
						))}
					</Select.Root>
				</VStack>

				{useToolName &&
					(() => {
						const selectedTool = tools.find(
							(tool) => tool.name === useToolName,
						);
						if (!selectedTool) return null;

						return (
							<SyntaxHighlighter style={oneDark} language={"json"} PreTag="div">
								{JSON.stringify(selectedTool, null, 2)}
							</SyntaxHighlighter>
						);
					})()}

				<VStack style={{ margin: "8px 0" }}>
					<label htmlFor={textAreaId}>Arguments (JSON):</label>
					<Textarea
						id={textAreaId}
						ref={argsRef}
						style={{ height: "80px" }}
						defaultValue='{"url": "https://google.com"}'
					/>
				</VStack>

				<Button
					type="button"
					onClick={handleCallTool}
					disabled={loading || !useToolName}
				>
					Call Tool
				</Button>
			</div>
		</VStack>
	);
};
