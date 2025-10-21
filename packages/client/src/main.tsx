import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { UIProvider } from "@packages/ui";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<UIProvider>
			<App />
		</UIProvider>
	</StrictMode>,
);
