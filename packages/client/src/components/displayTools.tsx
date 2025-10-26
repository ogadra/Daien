import { Button, Select, Textarea, VStack } from "@packages/ui";
import {
	type Dispatch,
	type JSX,
	type SetStateAction,
	useId,
	useRef,
} from "react";
import {
	callTool,
	type Tool,
	type ToolResponse,
} from "../../lib/PlaywrightMCPClient";

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

export const DisplayTools = (props: Props): JSX.Element => {
	const { tools, useToolName, setUseToolName, loading, setLoading, setResult } =
		props;
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

						const renderValue = (value: any, depth = 0): React.ReactNode => {
							const indent = "  ".repeat(depth);

							if (value === null)
								return <span style={{ color: "#999" }}>null</span>;
							if (value === undefined)
								return <span style={{ color: "#999" }}>undefined</span>;
							if (typeof value === "string")
								return <span style={{ color: "#0c7b2e" }}>"{value}"</span>;
							if (typeof value === "number")
								return <span style={{ color: "#0366d6" }}>{value}</span>;
							if (typeof value === "boolean")
								return (
									<span style={{ color: "#e3116c" }}>{value.toString()}</span>
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
												<span style={{ color: "#6f42c1" }}>"{key}"</span>:{" "}
												{renderValue(val, depth + 1)}
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
									margin: "8px 0",
									padding: "12px",
									backgroundColor: "#f6f8fa",
									borderRadius: "4px",
									fontFamily: "monospace",
									fontSize: "14px",
									textAlign: "left",
									overflowX: "scroll",
								}}
							>
								{renderValue(selectedTool)}
							</div>
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
