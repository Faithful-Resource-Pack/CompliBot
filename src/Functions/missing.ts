import { exec, series } from "@helpers/exec";
import { existsSync, readdirSync, statSync } from "fs";
import { mkdir } from "fs/promises";
import { getDisplayNameForPack, PACKS } from "@src/Slash Commands/Compliance/missing";
import { Client } from "@src/Extended Discord";
import { AnyChannel, VoiceChannel } from "discord.js";
import { join, normalize } from "path";
import { includesNone, normalizeArray } from "@helpers/arrays";

import os from "os";
import BLACKLIST from "@/blacklisted_textures.json";
import axios from "axios";

// return value for the compute function
export type MissingResult = [Buffer, Array<string>, { completion: number, edition: string, pack: string, version: string }];
export type MissingResults = Array<MissingResult>;

export const computeAll = async (client: Client, pack: string, version: string, callback: Function): Promise<MissingResults> => {
	const editions: Array<string> = (await axios.get(`${client.config.apiUrl}textures/editions`)).data;

	return Promise.all(editions.map(async (edition: string) => {
		return await compute(client, pack, edition, version, callback);
	}));
}

export const computeAndUpdateAll = async (client: Client, pack: string, version: string, callback: Function): Promise<MissingResults> => {
	const editions: Array<string> = (await axios.get(`${client.config.apiUrl}textures/editions`)).data;
	
	return Promise.all(editions.map(async (edition: string) => {
		return await computeAndUpdate(client, pack, edition, version, callback);
	}));
}

export const computeAndUpdate = async (client: Client, pack: string, edition: string, version: string, callback: Function): Promise<MissingResult> => {
	return compute(client, pack, edition, version, callback)
		.then(async (results) => {
			if (client !== null) {
				let channel: AnyChannel;
				try {
					channel = await client.channels.fetch(client.config.packProgress[results[2].pack][results[2].edition]);
				} catch { return; } // channel can't be fetch, abort mission!

				// you may add differents pattern depending on the channel type using the switch below
				switch (channel.type) {
					case "GUILD_VOICE":
						await (channel as VoiceChannel).setName(`${getDisplayNameForPack(results[2].pack)} | ${results[2].edition.charAt(0).toUpperCase() + results[2].edition.substr(1)}: ${results[2].completion}%`);
						break;
				
					default:
						break;
				}
			}

			return results;
		})
};

export const compute = async (client: Client, pack: string, edition: string, version: string, callback: Function): Promise<MissingResult> => {
	if (callback === undefined) callback = async () => {};

	const repo = (await axios.get(`${client.config.apiUrl}settings/repositories.git`)).data;
	const repoDefault = repo.default[edition];
	const repoRequest = repo[pack][edition];

	// pack doesn't support edition (ex: Compliance 64x -> dungeons)
	if (repoRequest === undefined) return [null, [`${getDisplayNameForPack(pack)} doesn't support ${edition} edition.`], { completion: 0, pack: pack, edition: edition, version: version }];

	await callback("Steps will be listed here").catch((err: any) => Promise.reject(err));
	
	const tmpDirPath: string = normalize(os.tmpdir());
	const tmpDirPathDefault: string = join(tmpDirPath, `missing-default-${edition}`); 
	const tmpDirPathRequest: string = join(tmpDirPath, `missing-${pack}-${edition}`);

	// CLONE REPO IF NOT ALREADY CLONED
	let exists: boolean = existsSync(tmpDirPathDefault);
	if (!exists) {
		await callback(`Downloading default ${edition} pack...`).catch((err: any) => Promise.reject(err));
		mkdir(tmpDirPathDefault);
		await exec(`git clone ${repoDefault} .`, { cwd:tmpDirPathDefault });
	}

	exists = existsSync(tmpDirPathRequest);
	if (!exists) {
		await callback(`Downloading \`${getDisplayNameForPack(pack)}\` (${edition}) pack...`).catch((err: any) => Promise.reject(err));
		mkdir(tmpDirPathRequest);
		await exec(`git clone ${repoRequest} .`, { cwd:tmpDirPathRequest });
	}

	await callback("Updating packs with latest version known...").catch((err: any) => Promise.reject(err));
	const versions: Array<string> = (await axios.get(`${client.config.apiUrl}settings/versions.${edition}`)).data;
	if (!versions.includes(version)) version = versions[0]; // latest version if versions doesn't include version (unexisting/unsupported)

	/**
	 * STEPS:
	 * - stash
	 * - checkout latest branch
	 * - pull
	 */
	await Promise.all([
		series([
			"git stash",
			`git checkout ${version}`,
			`git pull`
		], {
			cwd: tmpDirPathDefault
		}),
		series([
			"git stash",
			`git checkout ${version}`,
			`git pull`
		], {
			cwd: tmpDirPathRequest
		})
	]).catch(err => Promise.reject(err));

	await callback("Searching for differences...").catch(err => Promise.reject(err));
	const editionFilter = edition === "java" ? normalizeArray(BLACKLIST.java) : normalizeArray(BLACKLIST.bedrock);

	const texturesDefault: Array<string> = getAllFilesFromDir(tmpDirPathDefault, editionFilter).map(f => normalize(f).replace(tmpDirPathDefault, ''));
	const texturesRequest: Array<string> = getAllFilesFromDir(tmpDirPathRequest, editionFilter).map(f => normalize(f).replace(tmpDirPathRequest, ''));

	// instead of looping in the check array for each checked element, we directly check if the
	// object has a value for the checked key
	const check = texturesRequest.reduce((o, key) => ({ ...o, [key]: true}), {})

	// get texture that aren't in the check object
	const diffResult: Array<string> = texturesDefault.filter((v) => !check[v]);

	const buffResult: Buffer = Buffer.from(diffResult.join('\n').replace(/\\/g,'/').replace(/\/assets\/minecraft/g,'').replace(/\/textures\//g,''), 'utf8');
	const progress: number = Math.round(10000 - diffResult.length / texturesDefault.length * 10000) / 100;

	return [buffResult, diffResult, { completion: progress, edition: edition, pack: pack, version: version }];
}

export const getAllFilesFromDir = (dir: string, filter = []): Array<string> => {
	let res = [];
	readdirSync(dir).forEach((file) => {
		file = normalize(join(dir, file));
		const stat = statSync(file);

		if (!file.includes('.git')) {
			if (stat && stat.isDirectory()) res = res.concat(getAllFilesFromDir(file, filter));
			else {
				if (file.endsWith('.png') && includesNone(filter, file)) res.push(file);
			}
		}
	})

	return res;
}