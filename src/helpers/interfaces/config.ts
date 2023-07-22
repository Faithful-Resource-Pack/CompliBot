export interface Config {
	teams: Array<Team>;
	discords: Array<Discord>;
}

export interface Discord {
	team?: string; // tell if discord guilds are teamed up (for global commands)
	name: string;
	id: string;
	roles?: { [role: string]: string };
}

export type Team = Omit<Discord, "id" | "roles"> & {
	roles: { [role: string]: Array<string> };
};
