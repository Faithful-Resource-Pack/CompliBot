export type MinecraftEdition = "java" | "bedrock";

export type FaithfulPack =
	| "faithful_32x"
	| "faithful_64x"
	| "classic_faithful_32x"
	| "classic_faithful_32x_progart"
	| "classic_faithful_64x";

export type VanillaPack = "default" | "progart";

export type AnyPack = FaithfulPack | VanillaPack;

export interface PackGitHub {
	repo: string;
	org: string;
}

export interface Pack {
	id: AnyPack;
	name: string;
	tags: string[];
	resolution: number;
	github: Record<MinecraftEdition, PackGitHub>;
}

export interface Submission {
	id: FaithfulPack;
	reference: AnyPack | null;
	channels: SubmissionChannels;
	council_enabled: boolean;
	time_to_results: number;
	time_to_council?: number; // not used if council disabled
	contributor_role?: string;
}

// just the channels
export interface SubmissionChannels {
	submit: string;
	council?: string; // not used if council disabled
	results: string;
}
