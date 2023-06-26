export interface Config {
	firestormUrl: string;
	images: string;
	teams: Array<Team>;
	discords: Array<Discord>;
	packProgress: {
		[pack_slug: string]: {
			[edition: string]: string;
		};
	};
}

export interface Discord {
	team?: string; // tell if discord guilds are teamed up (for global commands)
	name: string;
	id: string;
	channels: { [updateMember: string]: string };
	roles?: { [role: string]: string };
}

export type Team = Omit<Discord, "id" | "roles"> & {
	roles: { [role: string]: Array<string> };
};
