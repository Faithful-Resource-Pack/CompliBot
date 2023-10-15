import { exec, series } from "@helpers/exec";
import { existsSync, readdirSync, statSync } from "fs";
import { mkdir } from "fs/promises";
import formatName from "@utility/formatName";
import { Client } from "@client";
import { ChannelType, VoiceChannel } from "discord.js";
import { join, normalize } from "path";

import os from "os";
import blacklistedTextures from "@json/blacklisted_textures.json";
import axios from "axios";

// return value for the compute function
export interface MissingOptions {
	completion: number;
	edition: string;
	pack: string;
	version: string;
	total?: number;
}

export type MissingResult = [Buffer, string[], MissingOptions, Buffer?];

export const computeAll = async (
	client: Client,
	pack: string,
	version: string,
	callback: Function,
): Promise<MissingResult[]> => {
	const editions: string[] = (await axios.get(`${client.tokens.apiUrl}textures/editions`)).data;

	return Promise.all(
		editions.map(
			async (edition: string) => await compute(client, pack, edition, version, callback),
		),
	);
};

export const computeAndUpdateAll = async (
	client: Client,
	pack: string,
	version: string,
	callback: Function,
): Promise<MissingResult[]> => {
	const editions: string[] = (await axios.get(`${client.tokens.apiUrl}textures/editions`)).data;

	return Promise.all(
		editions.map(
			async (edition: string) => await computeAndUpdate(client, pack, edition, version, callback),
		),
	);
};

/**
 * same interface as compute but updates the VCs too
 */
export const computeAndUpdate = async (
	client: Client,
	pack: string,
	edition: string,
	version: string,
	callback: Function,
): Promise<MissingResult> => {
	const results = await compute(client, pack, edition, version, callback);
	if (!client) return results;

	console.log("compute results fetched");

	const packProgress = (await axios.get(`${client.tokens.apiUrl}settings/channels.pack_progress`))
		.data;

	console.log(`pack progress fetched successfully: ${JSON.stringify(packProgress)}`);

	const channel = client.channels.cache.get(packProgress[results[2].pack][results[2].edition]);
	// channel doesn't exist or can't be fetched, return early
	if (!channel) return results;

	console.log(`channel fetched successfully: ${(channel as VoiceChannel).name}`);

	// you can add different patterns depending on the channel type
	switch (channel.type) {
		case ChannelType.GuildVoice:
			const pattern = /[.\d+]+(?!.*[.\d+])/;
			if (channel.name.match(pattern)?.[0] == results[2].completion.toString()) break;

			console.log(`channel hasn't been updated yet: ${channel.name.match(pattern)?.[0]}`)

			const updatedName = channel.name.replace(pattern, results[2].completion.toString());

			console.log(`name has been changed to ${updatedName}`);

			channel.setName(updatedName).catch(console.error);

			console.log("channel name set successfully");
			break;
	}

	return results;
};

/**
 * this is the main computing function that all the other ones use internally
 */
export const compute = async (
	client: Client,
	pack: string,
	edition: string,
	version: string,
	callback: Function,
): Promise<MissingResult> => {
	if (callback === undefined) callback = async () => {};

	const repo = (await axios.get(`${client.tokens.apiUrl}settings/repositories.git`)).data;
	const repoDefault = repo.default[edition];
	const repoRequest = repo[pack][edition];

	// pack doesn't support edition yet
	if (repoRequest === undefined)
		return [
			null,
			[`${formatName(pack)[0]} doesn't support ${edition} edition.`],
			{ completion: 0, pack: pack, edition: edition, version: version },
		];

	const tmpDirPath = normalize(os.tmpdir());
	const tmpDirPathDefault = join(tmpDirPath, `missing-default-${edition}`);
	const tmpDirPathRequest = join(tmpDirPath, `missing-${pack}-${edition}`);

	// CLONE REPO IF NOT ALREADY CLONED
	if (!existsSync(tmpDirPathDefault)) {
		await callback(`Downloading default ${edition} pack...`);
		mkdir(tmpDirPathDefault);
		await exec(`git clone ${repoDefault} .`, { cwd: tmpDirPathDefault });
	}

	if (!existsSync(tmpDirPathRequest)) {
		await callback(`Downloading \`${formatName(pack)[0]}\` (${edition}) pack...`);
		mkdir(tmpDirPathRequest);
		await exec(`git clone ${repoRequest} .`, { cwd: tmpDirPathRequest });
	}

	const versions: string[] = (
		await axios.get(`${client.tokens.apiUrl}textures/versions/${edition}`)
	).data;
	// latest version if versions doesn't include version (unexisting/unsupported)
	if (!versions.includes(version)) version = versions[0];
	await callback(`Updating packs with latest version of \`${version}\` known...`);

	// for some reason specifying the steps in a variable and loading it here breaks?
	await Promise.all([
		series(["git stash", "git remote update", "git fetch", `git checkout ${version}`, `git pull`], {
			cwd: tmpDirPathDefault,
		}),
		series(["git stash", "git remote update", "git fetch", `git checkout ${version}`, `git pull`], {
			cwd: tmpDirPathRequest,
		}),
	]);

	await callback("Searching for differences...");

	const editionFilter = blacklistedTextures[edition].map(normalize);

	const texturesDefault = getAllFilesFromDir(tmpDirPathDefault, editionFilter).map((f) =>
		normalize(f).replace(tmpDirPathDefault, ""),
	);
	const texturesRequest = getAllFilesFromDir(tmpDirPathRequest, editionFilter).map((f) =>
		normalize(f).replace(tmpDirPathRequest, ""),
	);

	// instead of looping in the check array for each checked element, we directly check if the
	// object has a value for the checked key
	const check = texturesRequest.reduce((o, key) => ({ ...o, [key]: true }), {});

	// get texture that aren't in the check object
	const diffResult = texturesDefault.filter((v) => !check[v]);
	const nonvanillaTextures = texturesRequest.filter(
		(texture) =>
			!texturesDefault.includes(texture) &&
			!texture.endsWith("huge_chungus.png") && // we do a little trolling
			!editionFilter.includes(texture) &&
			(texture.replace(/\\/g, "/").startsWith("/assets/minecraft/textures") ||
				texture.replace(/\\/g, "/").startsWith("/assets/realms") ||
				texture.replace(/\\/g, "/").startsWith("/textures")),
	);

	const progress = Number((100 * (1 - diffResult.length / texturesDefault.length)).toFixed(2));

	return [
		Buffer.from(formatResults(diffResult), "utf8"),
		diffResult,
		{
			completion: progress,
			edition: edition,
			pack: pack,
			version: version,
			total: texturesDefault.length,
		},
		Buffer.from(formatResults(nonvanillaTextures), "utf8"),
	];
};

export const getAllFilesFromDir = (dir: string, filter: string[] = []): string[] => {
	const fileList = [];
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

export const formatResults = (results: string[]) =>
	results
		.join("\n")
		.replace(/\\/g, "/")
		.replace(/\/assets\/minecraft/g, "")
		// only match at start of line so realms/optifine aren't affected
		.replace(/^\/textures\//gm, "");
