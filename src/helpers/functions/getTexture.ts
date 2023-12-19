import { EmbedBuilder } from "@client";
import axios from "axios";
import { APIEmbedField, AttachmentBuilder, Interaction } from "discord.js";
import { magnify, magnifyToAttachment } from "@images/magnify";
import { colors } from "@utility/colors";
import {
	Texture,
	Contribution,
	FaithfulPack,
	Contributor,
	GalleryTexture,
	MinecraftEdition,
} from "@interfaces/firestorm";
import { animateToAttachment } from "@images/animate";
import minecraftSorter from "@utility/minecraftSorter";
import formatPack from "@utility/formatPack";
import { textureButtons } from "@utility/buttons";
import { Image, loadImage } from "@napi-rs/canvas";
import { toTitleCase } from "@utility/methods";

/**
 * Create a full texture embed with provided information
 * @author Juknum, Evorp, RobertR11
 * @returns reply options
 */
export async function getTexture(interaction: Interaction, texture: Texture, pack: FaithfulPack) {
	const apiUrl = interaction.client.tokens.apiUrl;
	const isAnimated = Object.keys(texture.mcmeta).length;
	const contributionJSON: Contributor[] = (await axios.get(`${apiUrl}contributions/authors`)).data;

	const { name, iconURL } = formatPack(pack);

	const files: AttachmentBuilder[] = [];
	const embed = new EmbedBuilder().setTitle(`[#${texture.id}] ${texture.name}`).setFooter({
		text: name,
		iconURL,
	});

	let textureURL: string;
	try {
		textureURL = (await axios.get(`${apiUrl}textures/${texture.id}/url/${pack}/latest`)).request.res
			.responseUrl;
	} catch {
		textureURL = "";
	}

	// test if url isn't a 404
	let image: Image;
	try {
		image = await loadImage(textureURL);
	} catch (err) {
		const errorEmbed = new EmbedBuilder()
			.setTitle(interaction.strings().error.texture.no_image.title)
			.setDescription(
				interaction
					.strings()
					.error.texture.no_image.description.replace("%TEXTURENAME%", texture.name)
					.replace("%PACK%", name),
			)
			.setColor(colors.red);
		// missing texture so we break early
		return { embeds: [errorEmbed], components: [] };
	}

	embed
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${texture.id}`)
		.addFields({ name: "Resolution", value: `${image.width}×${image.height}` })
		.setThumbnail(textureURL)
		.setImage(`attachment://${isAnimated ? "animated.gif" : "magnified.png"}`);

	let mainContribution: Contribution;
	if (texture.contributions.length) {
		mainContribution = texture.contributions
			.filter((contribution) => pack === contribution.pack)
			.sort((a, b) => (a.date > b.date ? -1 : 1))[0];
	}

	// field gets skipped for 16x and textures without contributions
	if (mainContribution) {
		const authors = mainContribution.authors.map((authorId) => {
			if (interaction.guild.members.cache.get(authorId)) return `<@!${authorId}>`;

			// fetch username if not in server
			return contributionJSON.find((user) => user.id == authorId)?.username ?? "Anonymous";
		});

		const displayContribution = `<t:${Math.trunc(mainContribution.date / 1000)}:d> – ${authors.join(
			", ",
		)}`;

		embed.addFields({
			name: authors.length == 1 ? "Latest Author" : "Latest Authors",
			value: displayContribution,
		});
	}

	embed.addFields(addPathsToEmbed(texture));

	if (isAnimated) {
		// only add mcmeta field if there's special properties there
		if (Object.keys(texture.mcmeta?.animation ?? {}).length)
			embed.addFields({
				name: "MCMETA",
				value: `\`\`\`json\n${JSON.stringify(texture.mcmeta.animation)}\`\`\``,
			});

		const { magnified } = await magnify(textureURL, { isAnimation: true });
		files.push(await animateToAttachment(magnified, texture.mcmeta));
	} else files.push(await magnifyToAttachment(textureURL));

	return { embeds: [embed], files: files, components: [textureButtons], ephemeral: false };
}

/**
 * Generate embed fields for a given texture's paths
 * @author Juknum
 * @param texture texture to get paths and uses from
 * @returns usable embed field data
 */
export const addPathsToEmbed = (texture: GalleryTexture | Texture): APIEmbedField[] => {
	const tmp: Record<MinecraftEdition, string[]> = {} as any;

	texture.uses.forEach((use) => {
		texture.paths
			.filter((el) => el.use === use.id)
			.forEach((p) => {
				const versions = p.versions.sort(minecraftSorter);
				const versionRange = `\`[${
					versions.length > 1 ? `${versions[0]} – ${versions.at(-1)}` : versions[0]
				}]\``;
				const formatted = `${versionRange} ${p.name}`;
				if (tmp[use.edition]) tmp[use.edition].push(formatted);
				else tmp[use.edition] = [formatted];
			});
	});

	return Object.keys(tmp).map((edition) => {
		if (tmp[edition].length) {
			return {
				name: toTitleCase(edition),
				value: tmp[edition].join("\n"),
			};
		}
	});
};
