import { exec, series } from "@helpers/exec";
import { existsSync, readdirSync, statSync } from "fs";
import { mkdir } from "fs/promises";
import { formatName } from "@helpers/sorter";
import { Client } from "@client";
import { Channel, ChannelType, VoiceChannel } from "discord.js";
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
		editions.map(async (edition: string) => {
			return await compute(client, pack, edition, version, callback);
		}),
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
		editions.map(async (edition: string) => {
			return await computeAndUpdate(client, pack, edition, version, callback);
		}),
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
	const packProgress = (await axios.get(`${client.tokens.apiUrl}settings/channels.pack_progress`)).data;

	let channel: Channel;
	try {
		channel = await client.channels.fetch(
			packProgress[results[2].pack][results[2].edition],
		);
	} catch {
		// channel doesn't exist or can't be fetched, return early
		return results;
	}

	// you can add different patterns depending on the channel type
	switch (channel.type) {
		case ChannelType.GuildVoice:
			const pattern = /[.\d+]+(?!.*[.\d+])/;
			if (channel.name.match(pattern)?.[0] == results[2].completion.toString()) break;

			const updatedName = channel.name.replace(pattern, results[2].completion.toString());
			await (channel as VoiceChannel).setName(updatedName);
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
		await callback(`Downloading default ${edition} pack...`).catch((err: any) =>
			Promise.reject(err),
		);
		mkdir(tmpDirPathDefault);
		await exec(`git clone ${repoDefault} .`, { cwd: tmpDirPathDefault });
	}

	if (!existsSync(tmpDirPathRequest)) {
		await callback(`Downloading \`${formatName(pack)[0]}\` (${edition}) pack...`).catch(
			(err: any) => Promise.reject(err),
		);
		mkdir(tmpDirPathRequest);
		await exec(`git clone ${repoRequest} .`, { cwd: tmpDirPathRequest });
	}

	const versions: string[] = (
		await axios.get(`${client.tokens.apiUrl}settings/versions.${edition}`)
	).data;
	if (!versions.includes(version)) version = versions[0]; // latest version if versions doesn't include version (unexisting/unsupported)
	await callback(`Updating packs with latest version of \`${version}\` known...`).catch(
		(err: any) => Promise.reject(err),
	);

	const steps = [
		"git stash",
		"git remote update",
		"git fetch",
		`git checkout ${version}`,
		`git pull`,
	];

	await Promise.all([
		series(steps, { cwd: tmpDirPathDefault }),
		series(steps, { cwd: tmpDirPathRequest }),
	]).catch((err) => Promise.reject(err));

	await callback("Searching for differences...").catch((err: any) => Promise.reject(err));

	const editionFilter = blacklistedTextures[edition].map((i: string) => i.normalize());

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
	let fileList = [];
	readdirSync(dir).forEach((file) => {
		file = normalize(join(dir, file));
		const stat = statSync(file);

		if (!file.includes(".git")) {
			if (stat.isDirectory()) fileList = fileList.concat(getAllFilesFromDir(file, filter));
			else {
				if (
					(file.endsWith(".png") || file.endsWith(".tga")) &&
					!filter.some((i) => file.includes(i))
				)
					fileList.push(file);
			}
		}
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
