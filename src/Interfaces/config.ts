export interface Config {
	colors: any;
	firestormUrl: string;
	images: string;
	channels: any;
	repositories: {
		compliance: Repository,
		vanilla: Repository
	},
	discords: {
		dev: string
	}
}

interface Repository {
	name: string,
	url: string,
	images: string
}
