import { MessageEmbed } from "@src/Extended Discord";
import ConfigJson from "@/config.json";
import { Config } from "@src/Interfaces";
import { minecraftSorter } from "./minecraftSorter";
import axios from "axios";
import getMeta from "./canvas/getMeta";
import { MessageAttachment } from "discord.js";
import { magnifyAttachment } from "./canvas/magnify";
import { ISizeCalculationResult } from "image-size/dist/types/interface";
import { colors } from "@helpers/colors";

export const getTextureMessageOptions = async (options: {
	texture: any;
	pack: string;
}): Promise<[MessageEmbed, Array<MessageAttachment>]> => {
	const config: Config = ConfigJson;
	const texture = options.texture;
	const pack = options.pack;
	const uses = texture.uses;
	const paths = texture.paths;

	let strPack: string;
	let strIconURL: string;
	switch (pack) {
		case "default":
			strPack = "Minecraft Default";
			strIconURL = config.images + "bot/texture_16x.png";
			break;
		case "c32":
			strPack = "Compliance 32x";
			strIconURL = config.images + "brand/logos/no%20background/64/Compliance%20Basic.png";
			break;
		case "c64":
			strPack = "Compliance 64x";
			strIconURL = config.images + "brand/logos/no%20background/64/Compliance%2064.png";
			break;

		case "classic_faithful_32":
			strPack = "Classic Faithful 32x";
			strIconURL = "https://raw.githubusercontent.com/ClassicFaithful/Branding/main/Logos/32x%20Scale/Main%2032x.png";
			break;
		case "classic_faithful_32_progart":
			strPack = "Classic Faithful 32x Programmer Art";
			strIconURL =
				"https://raw.githubusercontent.com/ClassicFaithful/Branding/main/Logos/32x%20Scale/Programmer%20Art%2032x.png";
			break;
		case "classic_faithful_64":
			strPack = "Classic Faithful 64x";
			strIconURL = "https://raw.githubusercontent.com/ClassicFaithful/Branding/main/Logos/32x%20Scale/Main%2032x.png";
			break;

		default:
			strPack = "Unknown Pack";
			strIconURL = "https://raw.githubusercontent.com/Compliance-Resource-Pack/App/main/resources/transparency.png";
			break;
	}

	const files: Array<MessageAttachment> = [];
	const embed = new MessageEmbed()
		.setTitle(`[#${texture.id}] ${texture.name}`)
		.setThumbnail("attachment://magnified.png")
		.setFooter({
			text: `${strPack}`,
			iconURL: strIconURL,
		});

	let textureURL: string;
	try {
		textureURL = (await axios.get(`${config.apiUrl}textures/${texture.id}/url/${pack}/${paths[0].versions.sort(minecraftSorter).reverse()[0]}`)).request.res.responseUrl;;
	} catch {
		textureURL = "";
	}

	embed.setImage(textureURL);

	// test if url isn't a 404
	let validURL: boolean = false;
	let dimensions: ISizeCalculationResult;
	try {
		dimensions = await getMeta(textureURL);
		validURL = true;
	} catch (err) {
		textureURL = "https://raw.githubusercontent.com/Compliance-Resource-Pack/App/main/resources/transparency.png";
		embed.addField("Image not found", "This texture hasn't been made yet or is blacklisted!");
		embed.setColor(colors.red);
	}

	if (validURL) {
		embed.addField("Source", `[GitHub](${textureURL})`, true);
		embed.addField("Resolution", `${dimensions.width}×${dimensions.height}`, true);

		let contributions: Array<any> = texture.contributions
			.filter((c) => strPack.includes(c.resolution) && pack === c.pack)
			.sort((a, b) => a.date > b.date)
			.reverse()
			.map((c) => {
				let date = new Date(c.date);
				let strDate: string = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/${
					date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
				}/${date.getFullYear()}`;
				let authors = c.authors.map((authorId) => `<@!${authorId}>`);
				return `\`${strDate}\` ${authors.join(", ")}`;
			});

		if (contributions.length > 2) contributions = [...contributions.slice(0, 2), "[see more in the webapp...](https://webapp.compliancepack.net/#/gallery)"];
		if (contributions.length) embed.addField("Contributions", contributions.join("\n"), false);
	}

	let tmp = {};
	uses.forEach((use) => {
		paths
			.filter((el) => el.use === use.id)
			.forEach((p) => {
				const versions = p.versions.sort(minecraftSorter);
				if (tmp[use.edition])
					tmp[use.edition].push(
						`\`[${versions.length > 1 ? `${versions[0]} — ${versions[versions.length - 1]}` : versions[0]}]\` ${(use.assets !== null && use.assets !== "minecraft") ? use.assets + '/' : ''}${p.name}`,
					);
				else
					tmp[use.edition] = [
						`\`[${versions.length > 1 ? `${versions[0]} — ${versions[versions.length - 1]}` : versions[0]}]\` ${(use.assets !== null && use.assets !== "minecraft") ? use.assets + '/' : ''}${p.name}`,
					];
			});
	});

	Object.keys(tmp).forEach((edition) => {
		if (tmp[edition].length > 0) {
			embed.addField(
				edition.charAt(0).toLocaleUpperCase() + edition.slice(1),
				tmp[edition].join("\n").replaceAll(" textures/", "../"),
				false,
			);
		}
	});

	// magnifying the texture in thumbnail
	files.push(await magnifyAttachment({ url: textureURL, name: "magnified.png" }));

	return [embed, files];
};
