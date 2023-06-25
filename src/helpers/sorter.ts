import { Texture } from "@helpers/interfaces/firestorm";
import { EmbedFieldData } from "discord.js";
import ConfigJson from "@json/config.json";

/**
 * Sort Minecraft Version Numbers
 * Use this function as a filter for the sort() method:
 * [].sort(MinecraftSorter)
 */
export const MinecraftSorter: any = (a: string, b: string) => {
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

export const AddPathsToEmbed: any = (texture: Texture): EmbedFieldData[] => {
	let tmp = {};
	texture.uses.forEach((use) => {
		texture.paths
			.filter((el) => el.use === use.id)
			.forEach((p) => {
				const versions = p.versions.sort(MinecraftSorter);
				if (tmp[use.edition])
					tmp[use.edition].push(
						`\`[${versions.length > 1 ? `${versions[0]} — ${versions[versions.length - 1]}` : versions[0]}]\` ${
							use.assets !== null && use.assets !== "minecraft" ? use.assets + "/" : ""
						}${p.name}`,
					);
				else
					tmp[use.edition] = [
						`\`[${versions.length > 1 ? `${versions[0]} — ${versions[versions.length - 1]}` : versions[0]}]\` ${
							use.assets !== null && use.assets !== "minecraft" ? use.assets + "/" : ""
						}${p.name}`,
					];
			});
	});

	let final: EmbedFieldData[] = [];

	Object.keys(tmp).forEach((edition) => {
		if (tmp[edition].length > 0) {
			final.push({
				name: edition.charAt(0).toLocaleUpperCase() + edition.slice(1),
				value: tmp[edition].join("\n").replaceAll(" textures/", "../"),
			});
		}
	});

	return final;
};

export const FormatName = (pack: string, size: string = "512"): string[] => {
	// TODO: use API here
	let strPack: string;
	let strIconURL = ConfigJson.images + `branding/logos/transparent/${size}/`;
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
			strPack = "Classic Faithful 32x";
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
		default:
		case "default":
			strPack = "Minecraft Default";
			strIconURL = ConfigJson.images + "bot/texture_16x.png?w=64"; // have to redefine since the directory is different
			break;
	}
	return [strPack, strIconURL]

}