// settings.submission.packs
export interface Submissions {
	[name: string]: Pack;
}

// one specific pack instance
export interface Pack {
	channels: Channels;
	council_enabled: boolean;
	time_to_results: number;
	time_to_council?: number;
	contributor_role?: string;
}

// just the channels
export interface Channels {
	submit: string;
	council?: string;
	results: string;
}
