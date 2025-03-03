import { exec, series } from "@helpers/exec";
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import formatPack from "@utility/formatPack";
import { Client } from "@client";
import { ChannelType } from "discord.js";
import { join, normalize } from "path";

import ignoredTextures from "@json/ignored_textures.json";
import axios from "axios";
import type { MinecraftEdition, Pack, PackGitHub } from "@interfaces/database";

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
 * @returns Computed results
 */
export async function computeMissingResults(
	client: Client,
	pack: string,
	edition: MinecraftEdition,
	version: string,
	checkModded: boolean,
	callback?: (step: string) => Promise<void>,
): Promise<MissingResult> {
	callback ||= async () => {};

	const baseData = { pack, edition };
	const packs: Record<string, Pack> = (await axios.get(`${client.tokens.apiUrl}packs/raw`)).data;
	if (!packs[pack].github[edition])
		return {
			results: [`${formatPack(pack).name} doesn't support ${edition} edition.`],
			data: { ...baseData, version, completion: 0 },
		};

	const versions = (
		await axios.get<string[]>(`${client.tokens.apiUrl}textures/versions/${edition}`)
	).data;

	// latest version if versions doesn't include version (fix for autocomplete validation)
	if (!versions.includes(version)) version = versions[0];

	// same steps are reused for compared repos
	const [defaultPath, requestPath] = await Promise.all([
		syncRepo(packs.default, edition, version, callback),
		syncRepo(packs[pack], edition, version, callback),
	]);

	await callback("Searching for differences…");

	// ignore modded textures if we aren't checking modded
	const editionFilter = (
		checkModded && edition === "java"
			? ignoredTextures[edition]
			: [...ignoredTextures.modded, ...ignoredTextures[edition]]
	).map(normalize);

	const defaultTextures = getAllFiles(defaultPath, editionFilter).map((f) =>
		f.replace(defaultPath, ""),
	);

	const requestTextures = getAllFiles(requestPath, editionFilter).map((f) =>
		f.replace(requestPath, ""),
	);

	// https://dev.to/arnaud/using-array-prototype-includes-vs-set-prototype-has-to-filter-arrays-41fg
	const check = new Set(requestTextures);

	// get texture that aren't in the check object
	const diffResult = defaultTextures.filter((path) => !check.has(path));
	const nonvanillaTextures = requestTextures.filter(
		(path) =>
			!defaultTextures.includes(path) &&
			!path.endsWith("huge_chungus.png") && // we do a little trolling
			!editionFilter.includes(path) &&
			(path.replace(/\\/g, "/").startsWith("/assets/minecraft/textures") ||
				path.replace(/\\/g, "/").startsWith("/assets/realms") ||
				path.replace(/\\/g, "/").startsWith("/textures")),
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
 * @returns Array of computed results
 */
export async function computeAllEditions(
	client: Client,
	pack: string,
	version: string,
	checkModded: boolean,
	callback?: (step: string) => Promise<void>,
) {
	const editions: MinecraftEdition[] = (await axios.get(`${client.tokens.apiUrl}textures/editions`))
		.data;

	return Promise.all(
		editions.map((edition) =>
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
		.get(`${client.tokens.apiUrl}settings/discord.channels.pack_progress`)
		// fix for "Error: socket hang up", I know it's stupid but it works somehow
		.catch(() =>
			axios.get(`https://api.faithfulpack.net/v2/settings/discord.channels.pack_progress`),
		);

	if (!packProgress[results.pack] || !packProgress[results.pack][results.edition]) return;
	const channel = client.channels.cache.get(packProgress[results.pack][results.edition]);
	// channel doesn't exist or can't be fetched, return early
	if (!channel) return;

	// you can add different patterns depending on the channel type
	switch (channel.type) {
		case ChannelType.GuildVoice:
			const pattern = /[.\d+]+(?!.*[.\d+])/;
			if (channel.name.match(pattern)?.[0] === results.completion.toString()) break;
			const updatedName = channel.name.replace(pattern, results.completion.toString());
			channel.setName(updatedName).catch(console.error);
			break;
	}
}

/**
 * Update or create a GitHub repository
 * @author Evorp, Juknum
 * @returns Cloned path
 */
export async function syncRepo(
	pack: Pack,
	edition: MissingEdition,
	version: string,
	callback?: (step: string) => Promise<void>,
) {
	const githubInfo: PackGitHub = pack.github[edition];
	const url = gitToURL(githubInfo);
	const cwd = join(process.cwd(), BASE_REPOS_PATH, githubInfo.repo);

	if (!existsSync(cwd)) {
		await callback(`Downloading \`${pack.name}\` (${edition}) pack…`);
		mkdirSync(cwd, { recursive: true });
		await exec(`git clone ${url} .`, { cwd });
	}

	await callback(`Updating ${pack.name} with latest version of \`${version}\` known…`);
	await series(
		["git stash", "git remote update", "git fetch", `git checkout ${version}`, `git pull`],
		{ cwd },
	);

	return cwd;
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
			ignoredTextures.allowed_extensions.some((ex) => file.endsWith(`.${ex}`)) &&
			!filter.some((i) => file.includes(i))
		)
			fileList.push(normalize(file));
	});

	return fileList;
};

/**
 * Format an array of texture paths into a more human-readable format
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
