export interface Config {
	colors: any;
	firestormUrl: string;
	apiUrl: string;
	images: string;
	channels: { [key: string]: string };
	repositories: {
		compliance: Repository;
		vanilla: Repository;
	};
	discords: Array<Discord>;
	submitChannels: { [key: string]: string };
	roles: {
		council: { [key: string]: string };
	}
}

interface Discord {
	name: string;
	id: string;
	updateMember?: string;
}

interface Repository {
	name: string;
	url: string;
	images: string;
}
