export interface Tool {
	name: string;
	description?: string;
	inputSchema: {
		type: "object";
		properties?: Record<string, unknown> | undefined;
		required?: string[] | undefined;
	} & { [k: string]: unknown };
	annotations?: {
		title?: string;
		readOnlyHint?: boolean;
		destructiveHint?: boolean;
		openWorldHint?: boolean;
	};
}

export interface ImageContent {
	data: string;
	mimeType: string;
}

// export interface ToolResponse {
// 	text: string;
// 	images: ImageContent[];
// }

export type ToolResponse =
	| {
			type: "text";
			text: string;
	  }
	| {
			type: "image";
			data: string;
			mimeType: string;
	  };

export interface ToolCallArgs {
	[k: string]: ToolCallArgs;
}
