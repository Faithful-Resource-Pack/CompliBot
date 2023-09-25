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
