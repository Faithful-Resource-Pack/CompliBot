export interface Tokens {
	prefix: string; // for shorthand prefix commands
	token: string;
	apiUrl: string;
	apiToken?: string; // for api authentication
	errorChannel: string; // error channel where errors are sent
	developers: string[]; // people authorized to use dev-only commands and features
	gitToken: string; // for feedback system
	dev: boolean; // if true: instantiate command only it the bot dev discord server
	verbose: boolean; // show extra logs for debugging
	maintenance: boolean; // if true: disallow normal bot functions and update status
	status?: string; // optionally specify a url to post the bot status to
}
