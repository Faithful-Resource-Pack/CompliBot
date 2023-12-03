import { exec, series } from "@helpers/exec";
import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import formatName from "@utility/formatName";
import { Client } from "@client";
import { ChannelType } from "discord.js";
import { join, normalize } from "path";

import blacklistedTextures from "@json/blacklisted_textures.json";
import axios from "axios";
import { FaithfulPack } from "@interfaces/firestorm";

// starting from process.cwd()
export const BASE_REPOS_PATH = "repos";

// the stuff that was computed
export interface MissingData {
	completion: number;
	edition: string;
	pack: FaithfulPack;
	version: string;
	total?: number;
}

// files, context, etc
export interface MissingResult {
	diffFile: Buffer;
	results: string[];
	data: MissingData;
	nonvanillaFile?: Buffer;
}

/**
 * Compute missing results for a given pack, edition, and version
 * @author Juknum, Evorp
 */
export async function computeMissingResults(
	client: Client,
	pack: FaithfulPack,
	edition: string,
	version: string,
	callback?: (step: string) => Promise<void>,
): Promise<MissingResult> {
	if (!callback) callback = async () => {};

	const repo = (await axios.get(`${client.tokens.apiUrl}settings/repositories.git`)).data;
	const defaultRepo = repo.default[edition];
	const requestRepo = repo[pack][edition];

	// pack doesn't support edition yet
	if (!requestRepo)
		return {
			diffFile: null,
			results: [`${formatName(pack)[0]} doesn't support ${edition} edition.`],
			data: { completion: 0, pack, edition, version },
		};

	const basePath = join(process.cwd(), BASE_REPOS_PATH);
	const defaultPath = join(basePath, getNameFromGit(defaultRepo));
	const requestPath = join(basePath, getNameFromGit(requestRepo));

	// CLONE REPO IF NOT ALREADY CLONED
	if (!existsSync(defaultPath)) {
		await callback(`Downloading default ${edition} pack...`);
		mkdirSync(defaultPath, { recursive: true });
		await exec(`git clone ${defaultRepo} .`, { cwd: defaultPath });
	}

	if (!existsSync(requestPath)) {
		await callback(`Downloading \`${formatName(pack)[0]}\` (${edition}) pack...`);
		mkdirSync(requestPath, { recursive: true });
		await exec(`git clone ${requestRepo} .`, { cwd: requestPath });
	}

	const versions: string[] = (
		await axios.get(`${client.tokens.apiUrl}textures/versions/${edition}`)
	).data;
	// latest version if versions doesn't include version (unexisting/unsupported)
	if (!versions.includes(version)) version = versions[0];
	await callback(`Updating packs with latest version of \`${version}\` known...`);

	const steps = [
		"git stash",
		"git remote update",
		"git fetch",
		`git checkout ${version}`,
		`git pull`,
	];

	// same steps, just with different packs
	await Promise.all([
		series(structuredClone(steps), {
			cwd: defaultPath,
		}),
		series(structuredClone(steps), {
			cwd: requestPath,
		}),
	]);

	await callback("Searching for differences...");

	const editionFilter = blacklistedTextures[edition].map(normalize);

	const defaultTextures = getAllFilesFromDir(defaultPath, editionFilter).map((f) =>
		normalize(f).replace(defaultPath, ""),
	);
	const requestTextures = getAllFilesFromDir(requestPath, editionFilter).map((f) =>
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
		diffFile: Buffer.from(formatResults(diffResult), "utf8"),
		results: diffResult,
		data: {
			completion: Number((100 * (1 - diffResult.length / defaultTextures.length)).toFixed(2)),
			edition,
			pack,
			version,
			total: defaultTextures.length,
		},
		nonvanillaFile,
	};
}

/**
 * Compute missing results for all Minecraft editions
 * @author Juknum
 */
export async function computeAllEditions(
	client: Client,
	pack: FaithfulPack,
	version: string,
	callback?: (step: string) => Promise<void>,
) {
	const editions: string[] = (await axios.get(`${client.tokens.apiUrl}textures/editions`)).data;

	return Promise.all(
		editions.map(
			async (edition: string) =>
				await computeMissingResults(client, pack, edition, version, callback),
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
export const getAllFilesFromDir = (dir: string, filter: string[] = []): string[] => {
	const fileList: string[] = [];
	readdirSync(dir).forEach((file) => {
		file = normalize(join(dir, file));
		const stat = statSync(file);

		if (file.includes(".git")) return;
		if (stat.isDirectory()) return fileList.push(...getAllFilesFromDir(file, filter));
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
 * Get repository name from a .git URL
 * @author Evorp
 * @param url git URL
 * @returns repository name
 */
export const getNameFromGit = (url: string) =>
	(url.endsWith("/") ? url.slice(0, -1) : url).split("/").at(-1).split(".")[0];
