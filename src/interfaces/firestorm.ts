export type MinecraftEdition = "java" | "bedrock";

export type FaithfulPack =
	| "faithful_32x"
	| "faithful_64x"
	| "classic_faithful_32x"
	| "classic_faithful_32x_progart"
	| "classic_faithful_64x";

export type VanillaPack = "default" | "progart";

export type AnyPack = FaithfulPack | VanillaPack;

export interface Contribution {
	id: string;
	date: number; // unix timestamp
	texture: string; // texture ID
	resolution: number; // texture resolution
	pack: FaithfulPack;
	authors: string[];
}

export interface Contributor {
	id: string;
	contributions: number;
	username?: string;
	uuid?: string;
}

export interface Path {
	id: string;
	use: string; // use ID
	name: string; // texture path
	mcmeta: boolean; // true if animated
	versions: string[]; // texture versions
}

export interface Use {
	id: string;
	name: string;
	edition: MinecraftEdition;
}

// when you don't add the "all" flag when searching on the API
export interface BaseTexture {
	id: string;
	name: string;
	tags: string[];
}

export interface Texture extends BaseTexture {
	uses: Use[];
	paths: Path[];
	contributions?: Contribution[];
}

// used for comparison loader
export interface GalleryTexture extends Omit<Texture, keyof BaseTexture> {
	// texture properties are moved into their own object
	texture: BaseTexture;
	urls: Record<AnyPack, string>;
}

// settings.submission.packs
export type Submissions = Record<FaithfulPack, SubmissionPack>;

// one specific pack instance
export interface SubmissionPack {
	display_name: string;
	channels: Channels;
	council_enabled: boolean;
	time_to_results: number;
	time_to_council?: number; // not used if council disabled
	contributor_role?: string;
	github: Record<MinecraftEdition, { repo: string; org: string }>;
}

// just the channels
export interface Channels {
	submit: string;
	council?: string; // not used if council disabled
	results: string;
}
