export interface Tokens {
	firestormToken: string;
	token: string;
	prefix: string;
	appID: string; // bot id
	dev: boolean; // if true: instantiate command only it the bot dev discord server
}
