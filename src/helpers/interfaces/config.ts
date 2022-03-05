export interface Config {
	colors: any;
	firestormUrl: string;
	apiUrl: string;
	images: string;
	channels: { [key: string]: string }; //! deprecated (should be implemented in the discords field)
	repositories: {
		compliance: Repository;
		vanilla: Repository;
	};
	discords: Array<Discord>;
	submissions: { [pack: string]: SubmissionChannels };
	roles: {
		council: { [guild: string]: string };
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
	name: string;
	id: string;
	channels: {
		updateMember?: string;
	};
}

interface Repository {
	name: string;
	url: string;
	images: string;
}
