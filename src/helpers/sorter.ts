import { Texture } from "@interfaces";
import { APIEmbedField } from "discord.js";

/**
 * Sort Minecraft Version Numbers
 * Use this function as a filter for the sort() method:
 * [].sort(minecraftSorter)
 */
export const minecraftSorter = (a: string, b: string) => {
	const _a = a.split(".").map((s) => parseInt(s));
	const _b = b.split(".").map((s) => parseInt(s));

	const upper = Math.min(_a.length, _b.length);
	let i = 0;
	let res = 0;

	while (i < upper && res == 0) {
		res = _a[i] == _b[i] ? 0 : _a[i] < _b[i] ? -1 : 1; // each number
		++i;
	}

	if (res != 0) return res;
	return _a.length == _b.length ? 0 : _a.length < _b.length ? -1 : 1; // longer length wins
};

export const addPathsToEmbed = (texture: Texture): APIEmbedField[] => {
	const tmp = {};
	texture.uses.forEach((use) => {
		texture.paths
			.filter((el) => el.use === use.id)
			.forEach((p) => {
				const versions = p.versions.sort(minecraftSorter);
				const versionRange = `\`[${
					versions.length > 1 ? `${versions[0]} — ${versions[versions.length - 1]}` : versions[0]
				}]\``;
				const formatted = `${versionRange} ${p.name}`;
				if (tmp[use.edition]) tmp[use.edition].push(formatted);
				else tmp[use.edition] = [formatted];
			});
	});

	return Object.keys(tmp).map((edition) => {
		if (tmp[edition].length) {
			return {
				name: edition.charAt(0).toLocaleUpperCase() + edition.slice(1),
				value: tmp[edition].join("\n"),
			};
		}
	});
};

export const formatName = (pack: string, size: string = "512"): [string, string] => {
	// TODO: migrate from old config (ideally move to API if possible)
	let strPack: string;
	let strIconURL = `https://database.faithfulpack.net/images/branding/logos/transparent/${size}/`;
	switch (pack) {
		case "faithful_32x":
			strPack = "Faithful 32x";
			strIconURL += "f32_logo.png";
			break;
		case "faithful_64x":
			strPack = "Faithful 64x";
			strIconURL += "f64_logo.png";
			break;
		case "classic_faithful_32x":
			strPack = "Classic Faithful 32x Jappa";
			strIconURL += "cf32_logo.png";
			break;
		case "classic_faithful_32x_progart":
			strPack = "Classic Faithful 32x Programmer Art";
			strIconURL += "cf32pa_logo.png";
			break;
		case "classic_faithful_64x":
			strPack = "Classic Faithful 64x";
			strIconURL += "cf64_logo.png";
			break;
		case "progart":
			strPack = "Default Programmer Art";
			// have to redefine since root directory is different
			strIconURL = `https://database.faithfulpack.net/images/bot/progart.png?w=${size}`;
			break;
		default:
			strPack = "Default Jappa";
			strIconURL = `https://database.faithfulpack.net/images/bot/default.png?w=${size}`;
			break;
	}
	return [strPack, strIconURL];
};
