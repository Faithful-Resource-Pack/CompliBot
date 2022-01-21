import MessageEmbed from "@src/Client/embed";

import ConfigJson from "@/config.json";
import { Config } from "@src/Interfaces";
import { minecraftSorter } from "./minecraftSorter";
import axios from "axios";
import getMeta from "./canvas/getMeta";

export const getTexture = async (texture, resolution: number): Promise<MessageEmbed> => {
	const config: Config = ConfigJson;

	let embed = new MessageEmbed().setTitle(`[#${texture.id}] ${texture.name}`).setFooter({
		text: `${resolution === 16 ? "Vanilla Texture" : `Compliance ${resolution}×`}`,
		iconURL: `${resolution === 16 ? `${config.images}texture_16x.png` : `${config.images}monochrome_logo.png`}`,
	});

	const paths = await texture.paths();
	const edition = await paths[0].edition();
	const textureURL = config.repositories[resolution === 16 ? "vanilla" : "compliance"].images
		.replace("%EDITION%", edition.charAt(0).toLocaleUpperCase() + edition.slice(1))
		.replace("%RESOLUTION%", resolution.toString())
		.replace("%VERSION%", paths[0].versions.sort(minecraftSorter)[paths[0].versions.length - 1])
		.replace("%PATH%", paths[0].path);

	try {
		await axios.get(textureURL);
	} catch (err) {
		console.error(err);
	} // image url isn't valid (ex: 404)

	const dimension = await getMeta(textureURL);
	embed.addField("Resolution", `${dimension.width}×${dimension.height}`, true).setImage(textureURL);

	let tmp = {};
	for (let i = 0; i < paths.length; i++) {
		let edition = await paths[i].edition();
		let versions = paths[i].versions.sort(minecraftSorter);

		if (tmp[edition] === undefined) tmp[edition] = [];
		tmp[edition].push(
			`\`[${versions.length > 1 ? `${versions[0]} — ${versions[versions.length - 1]}` : versions[0]}]\` ${
				paths[i].path
			}`,
		);
	}

	Object.keys(tmp).forEach((edition) => {
		if (tmp[edition] && tmp[edition] !== 0)
			embed.addField(
				edition.charAt(0).toLocaleUpperCase() + edition.slice(1),
				tmp[edition].map((el) => el.replace("assets/minecraft/", "").replace("textures/", "")).join("\n"),
				false,
			);
	});

	return embed;
};
