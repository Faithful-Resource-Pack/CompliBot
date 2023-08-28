export interface Use {
	id: string;
	name: string;
	edition: "java" | "bedrock" | "dungeons";
}
export interface Uses extends Array<Use> {}
