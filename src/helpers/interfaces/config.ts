export interface Config {
	colors: any;
	firestormUrl: string;
	apiUrl: string;
	images: string;
	repositories: {
		compliance: Repository;
		vanilla: Repository;
	};
	teams: Array<Team>;
	discords: Array<Discord>;
	submissions: { [pack: string]: SubmissionChannels };
	roles: {
		[role: string]: { [guild: string]: string };
	};
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
	channels: {
		[updateMember: string]: string;
	};
}

interface Team extends Omit<Discord, "id"> {}

interface Repository {
	name: string;
	url: string;
	images: string;
}
