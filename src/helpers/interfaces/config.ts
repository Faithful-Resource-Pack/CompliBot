export interface Config {
	firestormUrl: string;
	apiUrl: string;
	images: string;
	repositories: {
		compliance: Repository;
		vanilla: Repository;
	};
	teams: Array<Team>;
	discords: Array<Discord>;
	packProgress: {
		[pack_slug: string]: {
			[edition: string]: string;
		};
	};
}

interface SubmissionChannels {
	submit: string;
	council: string;
}
interface Discord {
	team?: string; // tell if discord guilds are teamed up (for global commands)
	name: string;
	id: string;
	channels: {	[updateMember: string]: string };
	submissionSystem?: {
		council: string;
		submission: { [packName: string]: string };
	},
	roles?: { [role: string]: string };
}

type Team = Omit<Discord, "id" | "submissionSystem" | "roles"> & {
	roles: { [role: string]: Array<string> };
}

interface Repository {
	name: string;
	url: string;
	images: string;
}
