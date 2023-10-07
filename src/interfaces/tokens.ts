export interface Tokens {
	prefix: string; // for shorthand prefix commands
	token: string;
	apiUrl: string;
	apiPassword: string; // for api authentification
	errorChannel: string; // error channel where errors are sent
	developers: string[];
	gitToken: string;
	dev: boolean; // if true: instantiate command only it the bot dev discord server
	verbose: boolean; // show extra logs for debugging
	maintenance: boolean; // if true: disallow normal bot functions and update status
}
