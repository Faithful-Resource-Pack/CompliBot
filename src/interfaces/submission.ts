// settings.submission.packs
export interface Submissions {
	[pack: string]: Pack;
}

// one specific pack instance
export interface Pack {
	channels: Channels;
	council_enabled: boolean;
	time_to_results: number;
	time_to_council?: number; // not used if council disabled
	contributor_role?: string;
	github: {
		// java and bedrock
		[edition: string]: {
			repo: string;
			org: string;
		};
	};
}

// just the channels
export interface Channels {
	submit: string;
	council?: string; // not used if council disabled
	results: string;
}
