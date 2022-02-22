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
	submitChannels: { [key: string]: string }; //! deprecated
}

interface Discord {
	name: string;
	id: string;
	channels: {
		updateMember?: string;
		submitChannels?: { [key: string]: string }; // to be implemented
	};
}

interface Repository {
	name: string;
	url: string;
	images: string;
}
