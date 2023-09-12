import stitch from "@images/stitch";
import { magnify } from "@images/magnify";
import { loadImage } from "@napi-rs/canvas";
import { Client, MessageEmbed } from "@client";
import { MessageAttachment } from "discord.js";
import { formatName, addPathsToEmbed } from "@helpers/sorter";
import getDimensions from "@images/getDimensions";
import { Texture } from "@interfaces";
import axios from "axios";

/**
 * Generate a texture comparison by ID
 * @author Evorp
 * @param client Client used for getting config stuff
 * @param id texture id to look up
 * @returns reply and edit options
 */
export default async function textureComparison(
	client: Client,
	id: number | string,
	display: string = "all",
): Promise<any> {
	const isTemplate: boolean = typeof id == "string" && id.toLowerCase() == "template";
	const result: Texture = (await axios.get(`${client.tokens.apiUrl}textures/${id}/all`)).data;

	const PACKS = [
		["default", "faithful_32x", "faithful_64x"],
		["default", "classic_faithful_32x", "classic_faithful_64x"],
		["progart", "classic_faithful_32x_progart"],
	];

	let displayed: string[][];
	switch (display) {
		case "faithful":
		case "f":
			displayed = [PACKS[0]];
			break;
		case "cfjappa":
		case "cfj":
			displayed = [PACKS[1]];
			break;
		case "cfpa":
		case "pa":
		case "p":
			displayed = [PACKS[2]];
			break;
		case "jappa":
		case "j":
			displayed = [PACKS[0], PACKS[1]];
			break;
		default:
			displayed = PACKS;
			break;
	}

	if (!isTemplate) {
		const defaultURL: string = `${client.tokens.apiUrl}textures/${id}/url/default/latest`;

		const dimension = await getDimensions(defaultURL);
		if (dimension.width * dimension.height * displayed.flat().length > 262144) {
			return {
				embeds: [new MessageEmbed()
					.setTitle("Output will be too big!")
					.setDescription(
						"Try specifying which set of packs you want to view to reduce the total image size.",
					)
					.setFooter({ text: "Use [#template] for more information!" }),
					],
				components: []
			};
		}
	}

	// get texture urls
	let loadedImages = [];
	let i = 0;
	for (let packSet of displayed) {
		loadedImages.push([]);
		for (let pack of packSet) {
			const imgUrl = isTemplate
				? formatName(pack, "64")[1]
				: `${client.tokens.apiUrl}textures/${id}/url/${pack}/latest`;
			try {
				loadedImages[i].push(await loadImage(imgUrl));
			} catch {
				// image doesn't exist yet
			}
		}
		++i; // can't use forEach because of scope problems (blame js)
	}

	const longestRow = loadedImages.reduce((acc, item) => Math.max(acc, item.length), 0);
	const stitched = await stitch(loadedImages, longestRow == 3 ? 4 : 2);

	const magnified = (await magnify({ image: await loadImage(stitched), name: "magnified.png" }))[0];
	const embed = new MessageEmbed().setImage("attachment://magnified.png");

	if (isTemplate)
		embed.setTitle(`Comparison Template`).addFields([
			{
				name: "Add these suffixes to display only a specific group of textures!",
				value:
					"\
					\n- F: Show only Faithful textures \
					\n- CFJ: Show only Classic Faithful Jappa textures \
					\n- CFPA: Show only Classic Faithful Programmer Art textures \
					\n- J: Show only Jappa textures \
					\n- P: Show only Programmer Art textures (currently the same as CFPA)",
			},
		]);
	else
		embed
			.setTitle(`[#${result.id}] ${result.name}`)
			.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${id}`)
			.addFields(addPathsToEmbed(result))
			.setFooter({ text: "Use [#template] for more information!" });

	// empty array overwrites select menu choices if needed
	return { embeds: [embed], files: [magnified], components: [] };
}
