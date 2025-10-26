import { Button, Heading, HStack } from "@packages/ui";
import { type JSX, useMemo, useState } from "react";
import { MCPClient } from "../lib/MCPClient";
import type { Tool, ToolResponse } from "../lib/types";
import { Result } from "./components/result";
import { Tools } from "./components/tools";

const App = (): JSX.Element => {
	const [useToolName, setUseToolName] = useState<string>("browser_navigate");

	const [result, setResult] = useState<ToolResponse[]>([]);
	const [loading, setLoading] = useState(false);
	const [tools, setTools] = useState<Tool[]>([]);
	const client = useMemo(() => new MCPClient(), []);

	const handleInitialize = async () => {
		setLoading(true);
		try {
			await client.initialize();
			const res = await client.listTools();
			setTools(res.tools);
			setResult([
				{
					text: "Initialization and tool listing successful.",
					type: "text",
				},
			]);
		} catch (error) {
			setResult([
				{
					text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
					type: "text",
				},
			]);
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
				Call initalize & tools/list
			</Button>

			<HStack
				align="start"
				justify="center"
				gap="24px"
				style={{ width: "98%" }}
			>
				<Tools
					tools={tools}
					useToolName={useToolName}
					setUseToolName={setUseToolName}
					loading={loading}
					setLoading={setLoading}
					setResult={setResult}
					client={client}
				/>
				<Result result={result} loading={loading} />
			</HStack>
		</div>
	);
};

export default App;
