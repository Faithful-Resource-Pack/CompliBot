import { exec, series } from "@helpers/exec";
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import formatPack from "@utility/formatPack";
import { Client } from "@client";
import { ChannelType } from "discord.js";
import { join, normalize } from "path";

import blacklistedTextures from "@json/blacklisted_textures.json";
import axios from "axios";
import { MinecraftEdition, Pack, PackGitHub } from "@interfaces/database";

// starting from process.cwd()
export const BASE_REPOS_PATH = "repos";

// the stuff that was computed
export interface MissingData {
	edition: string;
	pack: string;
	version: string;
	// only created if everything exists
	completion?: number;
	total?: number;
}

// files, context, etc
export interface MissingResult {
	data: MissingData;
	results: string[];
	diffFile?: Buffer;
	nonvanillaFile?: Buffer;
}

export type MissingEdition = MinecraftEdition | "all";

/**
 * Compute missing results for a given pack, edition, and version
 * @author Juknum, Evorp
 */
export async function computeMissingResults(
	client: Client,
	pack: string,
	edition: MissingEdition,
	version: string,
	checkModded: boolean,
	callback?: (step: string) => Promise<void>,
): Promise<MissingResult> {
	if (!callback) callback = async () => {};

	const packs: Record<string, Pack> = (await axios.get(`${client.tokens.apiUrl}packs/raw`)).data;
	const defaultRepo = gitToURL(packs.default.github[edition]);
	const requestRepo = gitToURL(packs[pack].github[edition]);

	const baseData = { pack, edition };
	// pack doesn't support edition yet
	if (!requestRepo)
		return {
			results: [`${formatPack(pack).name} doesn't support ${edition} edition.`],
			data: { ...baseData, version, completion: 0 },
		};

	const basePath = join(process.cwd(), BASE_REPOS_PATH);
	const defaultPath = join(basePath, packs.default.github[edition].repo);
	const requestPath = join(basePath, packs[pack].github[edition].repo);

	// clone repos if not already done (saves a lot of init lol)
	if (!existsSync(defaultPath)) {
		await callback(`Downloading default ${edition} pack…`);
		mkdirSync(defaultPath, { recursive: true });
		await exec(`git clone ${defaultRepo} .`, { cwd: defaultPath });
	}

	if (!existsSync(requestPath)) {
		await callback(`Downloading \`${formatPack(pack)[0]}\` (${edition}) pack…`);
		mkdirSync(requestPath, { recursive: true });
		await exec(`git clone ${requestRepo} .`, { cwd: requestPath });
	}

	const versions: string[] = (
		await axios.get(`${client.tokens.apiUrl}textures/versions/${edition}`)
	).data;

	// latest version if versions doesn't include version (unexisting/unsupported)
	if (!versions.includes(version)) version = versions[0];
	await callback(`Updating packs with latest version of \`${version}\` known…`);

	// same steps are used for both packs
	const steps = [
		"git stash",
		"git remote update",
		"git fetch",
		`git checkout ${version}`,
		`git pull`,
	];

	await series(structuredClone(steps), { cwd: defaultPath });
	await series(structuredClone(steps), { cwd: requestPath });

	// now both repos are pointing to the same version and are ready to compare
	await callback("Searching for differences…");

	// blacklist modded textures if we aren't checking modded
	const editionFilter = (
		checkModded && edition === "java"
			? blacklistedTextures[edition]
			: [...blacklistedTextures.modded, ...blacklistedTextures[edition]]
	).map(normalize);

	const defaultTextures = getAllFiles(defaultPath, editionFilter).map((f) =>
		normalize(f).replace(defaultPath, ""),
	);
	const requestTextures = getAllFiles(requestPath, editionFilter).map((f) =>
		normalize(f).replace(requestPath, ""),
	);

	// instead of looping in the check array for each checked element, we directly check if the
	// object has a value for the checked key
	const check = requestTextures.reduce((o, key) => ({ ...o, [key]: true }), {});

	// get texture that aren't in the check object
	const diffResult = defaultTextures.filter((v) => !check[v]);
	const nonvanillaTextures = requestTextures.filter(
		(texture) =>
			!defaultTextures.includes(texture) &&
			!texture.endsWith("huge_chungus.png") && // we do a little trolling
			!editionFilter.includes(texture) &&
			(texture.replace(/\\/g, "/").startsWith("/assets/minecraft/textures") ||
				texture.replace(/\\/g, "/").startsWith("/assets/realms") ||
				texture.replace(/\\/g, "/").startsWith("/textures")),
	);

	// fix for returning an empty buffer which is still truthy
	const nonvanillaFile = nonvanillaTextures.length
		? Buffer.from(formatResults(nonvanillaTextures), "utf8")
		: null;

	return {
		data: {
			...baseData,
			version,
			completion: Number((100 * (1 - diffResult.length / defaultTextures.length)).toFixed(2)),
			total: defaultTextures.length,
		},
		results: diffResult,
		diffFile: Buffer.from(formatResults(diffResult), "utf8"),
		nonvanillaFile,
	};
}

/**
 * Compute missing results for all Minecraft editions
 * @author Juknum
 */
export async function computeAllEditions(
	client: Client,
	pack: string,
	version: string,
	checkModded: boolean,
	callback?: (step: string) => Promise<void>,
) {
	const editions: string[] = (await axios.get(`${client.tokens.apiUrl}textures/editions`)).data;

	return Promise.all(
		editions.map((edition: MissingEdition) =>
			computeMissingResults(client, pack, edition, version, checkModded, callback),
		),
	);
}

/**
 * Updates a progress VC channel with computed data
 * @author Evorp
 * @param client client to get channel with
 * @param results results to format channel with
 */
export async function updateVoiceChannel(client: Client, results: MissingData) {
	const { data: packProgress } = await axios
		.get(`${client.tokens.apiUrl}settings/channels.pack_progress`)
		// fix for "Error: socket hang up", I know it's stupid but it works somehow
		.catch(() => axios.get(`https://api.faithfulpack.net/v2/settings/channels.pack_progress`));

	const channel = client.channels.cache.get(packProgress[results.pack][results.edition]);
	// channel doesn't exist or can't be fetched, return early
	if (!channel) return;

	// you can add different patterns depending on the channel type
	switch (channel.type) {
		case ChannelType.GuildVoice:
			const pattern = /[.\d+]+(?!.*[.\d+])/;
			if (channel.name.match(pattern)?.[0] == results.completion.toString()) break;
			const updatedName = channel.name.replace(pattern, results.completion.toString());
			channel.setName(updatedName).catch(console.error);
			break;
	}
}

/**
 * Recursively get all files from a directory with a given filter
 * @author Evorp, Juknum
 * @param dir directory used for recursion
 * @param filter stuff to disallow
 * @returns array of all paths in the directory
 */
export const getAllFiles = (dir: string, filter: string[] = []): string[] => {
	const fileList: string[] = [];
	readdirSync(dir).forEach((file) => {
		file = normalize(join(dir, file));
		const stat = statSync(file);

		if (file.includes(".git")) return;
		if (stat.isDirectory()) return fileList.push(...getAllFiles(file, filter));
		if (
			blacklistedTextures.allowed_extensions.some((ex) => file.endsWith(`.${ex}`)) &&
			!filter.some((i) => file.includes(i))
		)
			fileList.push(file);
	});

	return fileList;
};

/**
 * Format an array of paths into a more human-readable format
 * @author Evorp
 * @param results array of results
 * @returns human readable string
 */
export const formatResults = (results: string[]) =>
	results
		.join("\n")
		.replace(/\\/g, "/")
		.replace(/\/assets\/minecraft/g, "")
		// only match at start of line so realms/optifine aren't affected
		.replace(/^\/textures\//gm, "");

/**
 * Get GitHub git URL from org and repo data
 * @author Evorp
 * @param github git information
 * @returns valid url
 */
export const gitToURL = ({ org, repo }: PackGitHub) => `https://github.com/${org}/${repo}.git`;
