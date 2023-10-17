import { EmbedBuilder } from "@client";
import TokenJson from "@json/tokens.json";
import { Contributor, Tokens } from "@interfaces";
import axios from "axios";
import { APIEmbedField, AttachmentBuilder, Guild } from "discord.js";
import { magnify, magnifyToAttachment } from "@images/magnify";
import { colors } from "@utility/colors";
import { Texture, Contribution } from "@interfaces";
import { animateToAttachment } from "@images/animate";
import minecraftSorter from "@utility/minecraftSorter";
import formatName from "@utility/formatName";
import { textureButtons } from "@utility/buttons";
import { Image, loadImage } from "@napi-rs/canvas";

/**
 * Create a full texture embed with provided information
 * @author Juknum, Evorp, RobertR11
 * @param options what textures to load
 * @returns reply options
 */
export const getTexture = async (options: {
	texture: Texture;
	pack: string;
	guild: Guild;
}): Promise<any> => {
	const tokens: Tokens = TokenJson;
	const { texture, pack, guild } = options;
	const { paths, contributions: allContributions } = texture;
	const animated = paths.filter((p) => p.mcmeta === true).length !== 0;
	const contributionJSON: Contributor[] = (await axios.get(`${tokens.apiUrl}contributions/authors`))
		.data;

	let mcmeta: any = {};
	if (animated) {
		const animatedPath = paths.filter((p) => p.mcmeta === true)[0];
		const raw = (await axios.get(`${tokens.apiUrl}settings/repositories.raw`)).data;

		try {
			mcmeta = (
				await axios.get(
					`${raw[pack].java}${animatedPath.versions.sort(minecraftSorter).reverse()[0]}/${
						animatedPath.name
					}.mcmeta`,
				)
			).data;
		} catch {
			mcmeta = { animation: {} };
		}
	}

	const [strPack, strIconURL] = formatName(pack);

	const files: AttachmentBuilder[] = [];
	const embed = new EmbedBuilder().setTitle(`[#${texture.id}] ${texture.name}`).setFooter({
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

	// test if url isn't a 404
	let image: Image;
	try {
		image = await loadImage(textureURL);
	} catch (err) {
		const errorEmbed = new EmbedBuilder()
			.setTitle("Image not found!")
			.setDescription(`\`${texture.name}\` hasn't been made for ${strPack} yet or is blacklisted!`)
			.setColor(colors.red);
		// missing texture so we break early
		return { embeds: [errorEmbed], components: [] };
	}

	embed
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${texture.id}`)
		.addFields({ name: "Resolution", value: `${image.width}×${image.height}` })
		.setThumbnail(textureURL)
		.setImage(`attachment://${animated ? "animated.gif" : "magnified.png"}`);

	let mainContribution: Contribution;
	if (allContributions.length) {
		mainContribution = allContributions
			.filter((c) => strPack.includes(c.resolution.toString()) && pack === c.pack)
			.sort((a, b) => (a.date > b.date ? -1 : 1))[0];
	}

	if (mainContribution) {
		const authors = mainContribution.authors.map((authorId) => {
			if (guild.members.cache.get(authorId)) return `<@!${authorId}>`;

			// fetch username if not in server
			return contributionJSON.find((user) => user.id == authorId)?.username ?? "Anonymous";
		});

		const displayContribution = `<t:${Math.trunc(mainContribution.date / 1000)}:d> — ${authors.join(
			", ",
		)}`;

		if (displayContribution != undefined) {
			embed.addFields({
				name: authors.length == 1 ? "Latest Author" : "Latest Authors",
				value: displayContribution,
			});
		}
	}

	embed.addFields(addPathsToEmbed(texture));

	// magnifying the texture in thumbnail
	if (animated) {
		if (Object.keys(mcmeta?.animation ?? {}).length)
			embed.addFields({
				name: "MCMETA",
				value: `\`\`\`json\n${JSON.stringify(mcmeta.animation)}\`\`\``,
			});

		const { magnified } = await magnify(textureURL, { isAnimation: true });
		files.push(await animateToAttachment(magnified, mcmeta));
	} else files.push(await magnifyToAttachment(textureURL));

	return { embeds: [embed], files: files, components: [textureButtons], ephemeral: false };
};

/**
 * Generate embed fields for a given texture's paths
 * @author Juknum
 * @param texture texture to get paths and uses from
 * @returns usable embed field data
 */
export const addPathsToEmbed = (texture: Texture): APIEmbedField[] => {
	const tmp = {};
	texture.uses.forEach((use) => {
		texture.paths
			.filter((el) => el.use === use.id)
			.forEach((p) => {
				const versions = p.versions.sort(minecraftSorter);
				const versionRange = `\`[${
					versions.length > 1 ? `${versions[0]} — ${versions.at(-1)}` : versions[0]
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
