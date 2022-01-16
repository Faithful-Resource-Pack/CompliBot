export interface Config {
	colors: any;
	firestormUrl: string;
	images: string;
	channels: any;
	repositories: {
		compliance: Repository,
		vanilla: Repository
	},
	discords: Array<Discord>
}

interface Discord {
	name: string;
	id: string;
	updateMember?: string;
}

interface Repository {
	name: string,
	url: string,
	images: string
}
