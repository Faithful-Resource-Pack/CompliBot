export interface Tokens {
	token: string;
	apiUrl: string;
	apiPassword: string; // for api authentification
	errorChannel: string; // error channel where errors are sent
	dev: boolean; // if true: instantiate command only it the bot dev discord server
	developers: string[];
	maintenance: boolean; // if true: disallow normal bot functions and update status
}
