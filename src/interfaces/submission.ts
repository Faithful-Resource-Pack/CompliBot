// settings.submission.packs
export interface Submissions {
	[name: string]: Pack;
}

// one specific pack instance
export interface Pack {
	channels: Channels;
	council_disabled: boolean;
	vote_time: number;
	council_time?: number;
	contributor_role?: string;
}

// just the channels
export interface Channels {
	submit: string;
	council?: string;
	results: string;
}
