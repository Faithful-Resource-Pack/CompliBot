import { MessageEmbed } from "@client";
import TokenJson from "@json/tokens.json";
import { Tokens } from "@interfaces";
import axios from "axios";
import getDimensions from "@images/getDimensions";
import { MessageAttachment, Guild } from "discord.js";
import { magnifyAttachment } from "@images/magnify";
import { ISizeCalculationResult } from "image-size/dist/types/interface";
import { colors } from "@helpers/colors";
import { Texture, Contribution } from "@interfaces";
import { animateAttachment } from "@images/animate";
import { formatName, minecraftSorter, addPathsToEmbed } from "@helpers/sorter";
import { textureButtons } from "@helpers/buttons";
import settings from "@json/dynamic/settings.json";

export const getTextureMessageOptions = async (options: {
	texture: Texture;
	pack: string;
	guild: Guild;
}): Promise<any> => {
	const tokens: Tokens = TokenJson;
	const { texture, pack, guild } = options;
	const { uses, paths, contributions: allContributions } = texture;
	const animated: boolean = paths.filter((p) => p.mcmeta === true).length !== 0;
	const contributionJSON = (await axios.get(`${tokens.apiUrl}contributions/authors`)).data;

	let mcmeta: any = {};
	if (animated) {
		const animatedPath = paths.filter((p) => p.mcmeta === true)[0];

		try {
			mcmeta = (
				await axios.get(
					`${settings.repositories.raw[pack].java}${
						animatedPath.versions.sort(minecraftSorter).reverse()[0]
					}/${animatedPath.name}.mcmeta`,
				)
			).data;
		} catch {
			mcmeta = { animation: {} };
		}
	}

	const [strPack, strIconURL] = formatName(pack);

	const files: Array<MessageAttachment> = [];
	const embed = new MessageEmbed().setTitle(`[#${texture.id}] ${texture.name}`).setFooter({
		text: `${strPack}`,
		iconURL: strIconURL,
	});

	let textureURL: string;
	try {
		textureURL = (await axios.get(`${tokens.apiUrl}textures/${texture.id}/url/${pack}/latest`))
			.request.res.responseUrl;
	} catch {
		textureURL = "";
	}

	embed.setThumbnail(textureURL);
	embed.setImage(`attachment://magnified.${animated ? "gif" : "png"}`);

	// test if url isn't a 404
	let dimension: ISizeCalculationResult;
	try {
		// getDimensions also validates a url
		dimension = await getDimensions(textureURL);
	} catch (err) {
		const errorEmbed = new MessageEmbed()
			.setTitle("Image not found!")
			.setDescription(`\`${texture.name}\` hasn't been made for ${strPack} yet or is blacklisted!`)
			.setColor(colors.red);
		// missing texture so we break early
		return { embeds: [errorEmbed], components: [] };
	}

	embed
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${texture.id}`)
		.addFields([
			{ name: "Resolution", value: `${dimension.width}×${dimension.height}`, inline: true },
		]);

	let mainContribution: Contribution;
	if (allContributions.length) {
		mainContribution = allContributions
			.filter((c) => strPack.includes(c.resolution.toString()) && pack === c.pack)
			.sort((a, b) => (a.date > b.date ? -1 : 1))[0];
	}

	if (mainContribution) {
		let strDate: string = `<t:${Math.trunc(mainContribution.date / 1000)}:d>`;
		let authors = mainContribution.authors.map((authorId: string) => {
			if (guild.members.cache.get(authorId)) return `<@!${authorId}>`;

			// this may possibly be one of the worst solutions but it somehow works
			for (let user of contributionJSON) {
				if (user.id == authorId) return user.username ?? "Anonymous";
			}
			return "Unknown";
		});

		const displayContribution = `${strDate} — ${authors.join(", ")}`;

		if (displayContribution != undefined) {
			embed.addFields([
				{
					name: authors.length == 1 ? "Latest Author" : "Latest Authors",
					value: displayContribution,
				},
			]);
		}
	}

	embed.addFields(addPathsToEmbed(texture));

	// magnifying the texture in thumbnail
	if (animated) {
		if (Object.keys(mcmeta?.animation ?? {}).length)
			embed.addFields([
				{ name: "MCMETA", value: `\`\`\`json\n${JSON.stringify(mcmeta.animation)}\`\`\`` },
			]);

		files.push(
			await animateAttachment({ url: textureURL, magnify: true, name: "magnified.gif", mcmeta }),
		);
	} else files.push((await magnifyAttachment({ url: textureURL, name: "magnified.png" }))[0]);

	return { embeds: [embed], files: files, components: [textureButtons] };
};
