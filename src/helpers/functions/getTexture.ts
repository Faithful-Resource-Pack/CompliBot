import { EmbedBuilder } from "@client";
import axios from "axios";
import { APIEmbedField, AttachmentBuilder } from "discord.js";
import { magnify, magnifyToAttachment } from "@images/magnify";
import { colors } from "@utility/colors";
import type {
	Texture,
	Contributor,
	GalleryTexture,
	MinecraftEdition,
	Pack,
} from "@interfaces/database";
import { animateToAttachment } from "@images/animate";
import minecraftSorter from "@utility/minecraftSorter";
import { textureButtons } from "@utility/buttons";
import { Image, loadImage } from "@napi-rs/canvas";
import { toTitleCase } from "@utility/methods";
import type { AnyInteraction } from "@interfaces/interactions";

/**
 * Create a full texture embed with provided information
 * @author Juknum, Evorp, RobertR11
 * @param interaction interaction to reply to
 * @param texture texture data to use
 * @param pack pack to get authors and formatting from
 * @param version optionally specify specific version to search
 * @returns reply options
 */
export async function getTexture(
	interaction: AnyInteraction,
	texture: Texture,
	pack: string,
	version = "latest",
) {
	const apiUrl = interaction.client.tokens.apiUrl;
	const isAnimated = texture.paths.some((p) => p.mcmeta === true);
	const packData: Pack = (await axios.get(`${apiUrl}packs/${pack}`)).data;

	const files: AttachmentBuilder[] = [];
	const embed = new EmbedBuilder().setTitle(`[#${texture.id}] ${texture.name}`).setFooter({
		text: packData.name,
		iconURL: packData.logo,
	});

	if (version !== "latest") embed.data.title += ` (${version})`;

	const textureURL = await axios
		.get(`${apiUrl}textures/${texture.id}/url/${pack}/${version}`)
		.then((res) => res.request.res.responseUrl)
		.catch(() => "");

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
					.replace("%VERSION%", version)
					.replace("%PACK%", packData.name),
			)
			.setColor(colors.red);
		// missing texture so we break early
		return { embeds: [errorEmbed], components: [] };
	}

	embed
		.setURL(
			`https://webapp.faithfulpack.net/gallery/${texture.uses[0].edition}/${pack}/${version}/all/?show=${texture.id}`,
		)
		.addFields({ name: "Resolution", value: `${image.width}×${image.height}` })
		.setThumbnail(textureURL)
		.setImage(`attachment://${isAnimated ? "animated.gif" : "magnified.png"}`);

	const lastContribution = texture.contributions
		.filter((contribution) => contribution.pack === pack)
		.sort((a, b) => (a.date > b.date ? -1 : 1))?.[0];

	if (lastContribution) {
		// surprisingly faster to fetch all users and filter on the client than doing a bunch of requests
		const contributionJSON: Contributor[] = (await axios.get(`${apiUrl}contributions/authors`))
			.data;

		const authors = lastContribution.authors.map((authorId) => {
			if (interaction.guild.members.cache.get(authorId)) return `<@${authorId}>`;

			// fetch username if not in server
			return contributionJSON.find((user) => user.id == authorId)?.username ?? "Anonymous";
		});

		const displayContribution = `<t:${Math.trunc(lastContribution.date / 1000)}:d> – ${authors.join(
			", ",
		)}`;

		embed.addFields({
			name: authors.length == 1 ? "Latest Author" : "Latest Authors",
			value: displayContribution,
		});

		/** @todo remove this when classic faithful credits are reasonably finished */
		if (["classic_faithful_32x"].includes(pack))
			embed.setAuthor({ name: "Note: This pack may have misleading or outdated credits." });
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

	return { embeds: [embed], files, components: [textureButtons], ephemeral: false };
}

/**
 * Generate embed fields for a given texture's paths
 * @author Juknum
 * @param texture texture to get paths and uses from
 * @returns usable embed field data
 */
export function addPathsToEmbed(texture: GalleryTexture | Texture): APIEmbedField[] {
	const groupedPaths: Partial<Record<MinecraftEdition, string[]>> = texture.uses.reduce(
		(acc, use) => {
			const paths = texture.paths
				.filter((el) => el.use === use.id)
				.map((p) => {
					const versions = p.versions.sort(minecraftSorter);
					const versionRange = `\`[${
						versions.length > 1 ? `${versions[0]} – ${versions[versions.length - 1]}` : versions[0]
					}]\``;
					return `${versionRange} ${p.name}`;
				});
			if (!acc[use.edition]) acc[use.edition] = [];
			acc[use.edition].push(...paths);
			return acc;
		},
		{},
	);

	// convert from use object to embed-compatible data
	return Object.entries(groupedPaths).map(([edition, paths]) => ({
		name: edition[0].toUpperCase() + edition.slice(1),
		value: paths.join("\n"),
	}));
}
