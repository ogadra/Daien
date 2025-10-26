import { Button, Heading, HStack } from "@packages/ui";
import { type JSX, useCallback, useState } from "react";
import {
	initialize,
	listTools,
	type Tool,
	type ToolResponse,
} from "../lib/PlaywrightMCPClient";
import { DisplayTools } from "./components/displayTools";
import { Result } from "./components/result";

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
				<Result result={result} loading={loading} />
			</HStack>
		</div>
	);
};

export default App;
