import { exec, series } from "@helpers/exec";
import { existsSync, readdirSync, statSync } from "fs";
import { mkdir } from "fs/promises";
import { formatName } from "@helpers/sorter";
import { Client } from "@client";
import { AnyChannel, VoiceChannel } from "discord.js";
import { join, normalize } from "path";
import settings from "@json/dynamic/settings.json";

import os from "os";
import BLACKLIST from "@json/blacklisted_textures.json";
import axios from "axios";

// return value for the compute function
export interface MissingOptions {
	completion: number;
	edition: string;
	pack: string;
	version: string;
	total?: number;
}
export type MissingResult = [Buffer, Array<string>, MissingOptions, Buffer?];
export type MissingResults = Array<MissingResult>;

export const computeAll = async (
	client: Client,
	pack: string,
	version: string,
	callback: Function,
): Promise<MissingResults> => {
	const editions: Array<string> = (await axios.get(`${client.tokens.apiUrl}textures/editions`))
		.data;

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
): Promise<MissingResults> => {
	const editions: Array<string> = (await axios.get(`${client.tokens.apiUrl}textures/editions`))
		.data;

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
	if (client !== null) {
		let channel: AnyChannel;
		try {
			channel = await client.channels.fetch(
				settings.channels.pack_progress[results[2].pack][results[2].edition],
			);
		} catch {
			/* channel doesn't exist or can't be fetched */
		}

		// you can add different patterns depending on the channel type
		switch (channel.type) {
			case "GUILD_VOICE":
				const pattern = /[.\d+]+(?!.*[.\d+])/;
				if ((channel.name.match(pattern) ?? [""])[0] == results[2].completion.toString()) break;

				const updatedName = channel.name.replace(pattern, results[2].completion.toString());
				await (channel as VoiceChannel).setName(updatedName);
				break;
		}
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

	// pack doesn't support edition (ex: Faithful 64x -> dungeons)
	if (repoRequest === undefined)
		return [
			null,
			[`${formatName(pack)[0]} doesn't support ${edition} edition.`],
			{ completion: 0, pack: pack, edition: edition, version: version },
		];

	const tmpDirPath: string = normalize(os.tmpdir());
	const tmpDirPathDefault: string = join(tmpDirPath, `missing-default-${edition}`);
	const tmpDirPathRequest: string = join(tmpDirPath, `missing-${pack}-${edition}`);

	// CLONE REPO IF NOT ALREADY CLONED
	let exists: boolean = existsSync(tmpDirPathDefault);
	if (!exists) {
		await callback(`Downloading default ${edition} pack...`).catch((err: any) =>
			Promise.reject(err),
		);
		mkdir(tmpDirPathDefault);
		await exec(`git clone ${repoDefault} .`, { cwd: tmpDirPathDefault });
	}

	exists = existsSync(tmpDirPathRequest);
	if (!exists) {
		await callback(`Downloading \`${formatName(pack)[0]}\` (${edition}) pack...`).catch(
			(err: any) => Promise.reject(err),
		);
		mkdir(tmpDirPathRequest);
		await exec(`git clone ${repoRequest} .`, { cwd: tmpDirPathRequest });
	}

	const versions: Array<string> = (
		await axios.get(`${client.tokens.apiUrl}settings/versions.${edition}`)
	).data;
	if (!versions.includes(version)) version = versions[0]; // latest version if versions doesn't include version (unexisting/unsupported)
	await callback(`Updating packs with latest version of \`${version}\` known...`).catch(
		(err: any) => Promise.reject(err),
	);

	/**
	 * STEPS:
	 * - stash
	 * - update local repo
	 * - checkout version X branch
	 * - pull
	 */
	await Promise.all([
		series(["git stash", "git remote update", "git fetch", `git checkout ${version}`, `git pull`], {
			cwd: tmpDirPathDefault,
		}),
		series(["git stash", "git remote update", "git fetch", `git checkout ${version}`, `git pull`], {
			cwd: tmpDirPathRequest,
		}),
	]).catch((err) => Promise.reject(err));

	await callback("Searching for differences...").catch((err: any) => Promise.reject(err));

	const editionFilter = (edition === "java" ? BLACKLIST.java : BLACKLIST.bedrock).map((i) =>
		i.normalize(),
	);

	const texturesDefault: Array<string> = getAllFilesFromDir(tmpDirPathDefault, editionFilter).map(
		(f) => normalize(f).replace(tmpDirPathDefault, ""),
	);
	const texturesRequest: Array<string> = getAllFilesFromDir(tmpDirPathRequest, editionFilter).map(
		(f) => normalize(f).replace(tmpDirPathRequest, ""),
	);

	// instead of looping in the check array for each checked element, we directly check if the
	// object has a value for the checked key
	const check = texturesRequest.reduce((o, key) => ({ ...o, [key]: true }), {});

	// get texture that aren't in the check object
	const diffResult: Array<string> = texturesDefault.filter((v) => !check[v]);
	const nonvanillaTextures = texturesRequest.filter(
		(texture) =>
			!texturesDefault.includes(texture) &&
			!texture.endsWith("huge_chungus.png") &&
			!editionFilter.includes(texture) &&
			(texture.replace(/\\/g, "/").startsWith("/assets/minecraft/textures") ||
				texture.replace(/\\/g, "/").startsWith("/assets/realms") ||
				texture.replace(/\\/g, "/").startsWith("/textures")),
	);

	const buffResult: Buffer = Buffer.from(
		diffResult
			.join("\n")
			.replace(/\\/g, "/")
			.replace(/\/assets\/minecraft/g, "")
			.replace(/\/textures\//g, ""),
		"utf8",
	);

	const nonvanillaResult: Buffer = Buffer.from(
		nonvanillaTextures
			.join("\n")
			.replace(/\\/g, "/")
			.replace(/\/assets\/minecraft/g, "")
			.replace(/\/textures\//g, ""),
		"utf8",
	);

	const progress: number =
		Math.round(10000 - (diffResult.length / texturesDefault.length) * 10000) / 100;

	return [
		buffResult,
		diffResult,
		{
			completion: progress,
			edition: edition,
			pack: pack,
			version: version,
			total: texturesDefault.length,
		},
		nonvanillaResult,
	];
};

export const getAllFilesFromDir = (dir: string, filter = []): Array<string> => {
	let fileList = [];
	readdirSync(dir).forEach((file) => {
		file = normalize(join(dir, file));
		const stat = statSync(file);

		if (!file.includes(".git")) {
			if (stat.isDirectory()) fileList = fileList.concat(getAllFilesFromDir(file, filter));
			else {
				if (
					(file.endsWith(".png") || file.endsWith(".tga")) &&
					!filter.some((i: string) => file.includes(i))
				)
					fileList.push(file);
			}
		}
	});

	return fileList;
};
