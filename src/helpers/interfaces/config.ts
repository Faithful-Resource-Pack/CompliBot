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

export interface SubmissionConfig {
  channel: string;
  slug: string;
  resolution: number;
  contributor_role: string;
  timeBeforeCouncil: number;
  timeBeforeResults: number;
  councilEnabled: boolean;
}
export type SubmissionConfigKeys = keyof SubmissionConfig;

export interface Discord {
  team?: string; // tell if discord guilds are teamed up (for global commands)
  name: string;
  id: string;
  channels: {
    [updateMember: string]: string;
  };
  submissionSystem?: {
    council: string;
    submission: {
      [packName: string]: SubmissionConfig;
    };
  };
  roles?: {
    [role: string]: string;
  };
}

export type Team = Omit<Discord, 'id' | 'submissionSystem' | 'roles'> & {
  roles: {
    [role: string]: Array<string>;
  };
};
