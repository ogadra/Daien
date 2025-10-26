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
import { callTool, type Tool, type ToolResponse } from "../../lib/MCPClient";

interface Props {
	tools: Tool[];
	useToolName: string;
	setUseToolName: Dispatch<SetStateAction<string>>;
	loading: boolean;
	setLoading: Dispatch<SetStateAction<boolean>>;
	setResult: Dispatch<SetStateAction<ToolResponse | null>>;
}

interface ToolCallArgs {
	[k: string]: ToolCallArgs;
}

const parseJSON = (str?: string): ToolCallArgs => {
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
}: Props): JSX.Element => {
	const argsRef = useRef<HTMLTextAreaElement | null>(null);
	const textAreaId = useId();

	const handleCallTool = async () => {
		if (!useToolName) return;
		setLoading(true);

		const toolArgs = argsRef.current?.value;
		try {
			const data = await callTool(useToolName, parseJSON(toolArgs));
			setResult(data);
		} catch (error) {
			setResult({
				text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
				images: [],
			});
		}
		setLoading(false);
	};

	return (
		<VStack width="50vw" align="center" justify="start">
			<div style={{ width: "80%" }}>
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
