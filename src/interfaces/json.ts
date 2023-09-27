export interface Tokens {
	token: string;
	apiUrl: string;
	apiPassword: string; // for api authentification
	errorChannel: string; // error channel where errors are sent
	developers: string[];
	dev: boolean; // if true: instantiate command only it the bot dev discord server
	verbose: boolean; // show extra logs for debugging
	maintenance: boolean; // if true: disallow normal bot functions and update status
}

export interface Discord {
	team?: string; // tell if discord guilds are teamed up (for global commands)
	name: string;
	id: string;
	channels?: { [channel: string]: string };
	roles?: { [role: string]: string };
}

export type Team = Omit<Discord, "id" | "roles"> & {
	roles: { [role: string]: string[] };
};

export interface Config {
	teams: Team[];
	discords: Discord[];
}
