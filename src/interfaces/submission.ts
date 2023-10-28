import { Edition } from "./firestorm";

// settings.submission.packs
export type Submissions = Record<string, SubmissionPack>;

// one specific pack instance
export interface SubmissionPack {
	channels: Channels;
	council_enabled: boolean;
	time_to_results: number;
	time_to_council?: number; // not used if council disabled
	contributor_role?: string;
	github: Record<Edition, { repo: string; org: string }>;
}

// just the channels
export interface Channels {
	submit: string;
	council?: string; // not used if council disabled
	results: string;
}
