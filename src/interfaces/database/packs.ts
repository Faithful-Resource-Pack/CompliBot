import { MinecraftEdition } from "./textures";

export interface PackGitHub {
	repo: string;
	org: string;
}

export interface Pack {
	id: string;
	name: string;
	tags: string[];
	logo: string;
	resolution: number;
	github: Record<MinecraftEdition, PackGitHub>;
}

export interface Submission {
	id: string;
	reference: string | null;
	channels: SubmissionChannels;
	time_to_results: number;
	contributor_role?: string;
}

// just the channels
export interface SubmissionChannels {
	submit: string;
	results: string;
}
