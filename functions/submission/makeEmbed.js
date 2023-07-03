const settings = require("../../resources/settings.json");
const getDimensions = require("../textures/getDimensions");
const getImages = require("../../helpers/getImages");
const minecraftSorter = require("../../helpers/minecraftSorter");
const { HorizontalStitcher } = require("../textures/stitch");
const { magnifyAttachment } = require("../textures/magnify");

const { MessageEmbed, MessageAttachment } = require("discord.js");
const EMOJIS = [settings.emojis.upvote, settings.emojis.downvote, settings.emojis.see_more];

/**
 * Make a submission embed using existing texture information
 * @author Juknum, Evorp
 * @param {DiscordClient} client
 * @param {DiscordMessage} message used for channel and author information
 * @param {MinecraftTexture} texture texture information
 * @param {MessageAttachment} attachment raw texture to embed
 * @param {Object} param additional info (e.g. description, coauthors)
 */
module.exports = async function makeEmbed(
	client,
	message,
	texture,
	attachment,
	param = new Object(),
) {
	/** @type {import("../../helpers/firestorm/texture_use.js").TextureUse[]} */
	let uses = await texture.uses();
	let pathText = [];

	for (let use of uses) {
		let localPath = await use.paths();
		pathText.push(`**${use.editions[0].charAt(0).toUpperCase() + use.editions[0].slice(1)}**\n`);
		for (let path of localPath) {
			let versions = path.versions.sort(minecraftSorter);
			pathText.push(`\`[${versions[0]}+]\` ${path.path}\n`);
		}
	}

	const paths = await uses[0].paths();
	const info = {
		path: paths[0].path,
		version: paths[0].versions.sort(minecraftSorter).reverse()[0],
		edition: uses[0].editions[0],
	};

	// TODO: when discord finishes name migration remove this code and just use message.author.username everywhere
	const authorName =
		message.author.discriminator == 0 ? `@${message.author.username}` : message.author.tag;

	let embed = new MessageEmbed()
		// TODO: add a Faithful gallery url that shows all textures by a given author
		.setAuthor({ name: authorName, iconURL: message.author.displayAvatarURL() })
		.setColor(settings.colors.blue)
		.setTitle(`[#${texture.id}] ${texture.name}`)
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${texture.id}`)
		.addFields([
			{ name: "Author", value: `<@!${param.authors.join(">\n<@!").toString()}>`, inline: true },
			{ name: "Status", value: `<:pending:${settings.emojis.pending}> Pending...`, inline: true },
			{ name: "\u200B", value: pathText.toString().replace(/,/g, ""), inline: false },
		]);

	// load raw image to pull from
	const rawImage = new MessageAttachment(attachment.url, `${texture.name}.png`);

	const dimensions = await getDimensions(attachment.url);
	if (dimensions.width * dimensions.height <= 262144) {
		/**
		 * COMPARISON IMAGE GENERATOR
		 */

		// determine reference image to compare against
		let repoKey;
		for (let [packKey, packValue] of Object.entries(settings.submission.packs)) {
			if (packValue.channels.submit == message.channel.id) {
				repoKey = packKey;
				break;
			}
		}

		let defaultRepo;
		switch (repoKey) {
			case "faithful_64x":
				defaultRepo = settings.repositories.raw.faithful_32x;
				break;
			case "classic_faithful_64x":
				defaultRepo = settings.repositories.raw.classic_faithful_32x;
				break;
			case "classic_faithful_32x_progart":
				defaultRepo = settings.repositories.raw.progart;
				break;
			default:
				defaultRepo = settings.repositories.raw.default;
				break;
		}
		const upscaledImage = await magnifyAttachment(attachment.url, "upscaled.png");
		let defaultImage;

		// load images necessary to generate comparison
		try {
			defaultImage = await magnifyAttachment(
				`${defaultRepo[info.edition.toLowerCase()]}${info.version}/${info.path}`,
				"default.png",
			);
		} catch {
			// reference texture doesn't exist so we use the default repo
			defaultImage = await magnifyAttachment(
				`${settings.repositories.raw.default[info.edition.toLowerCase()]}${info.version}/${
					info.path
				}`,
				"default.png",
			);
		}

		const drawer = new HorizontalStitcher();
		drawer.gap = 32;
		let imageUrls;

		try {
			const currentImage = await magnifyAttachment(
				`${settings.repositories.raw[repoKey][info.edition.toLowerCase()]}${info.version}/${
					info.path
				}`,
			);
			imageUrls = await getImages(client, defaultImage, upscaledImage, rawImage, currentImage);
			drawer.urls = [imageUrls[0], imageUrls[1], imageUrls[3]];
		} catch {
			// texture being submitted is a new texture, so there's nothing to compare against
			imageUrls = await getImages(client, defaultImage, upscaledImage, rawImage);
			drawer.urls = [imageUrls[0], imageUrls[1]];
		}

		// generate comparison and add to embed
		const comparisonImage = new MessageAttachment(await drawer.draw(), "compared.png");
		const comparisonUrls = await getImages(client, comparisonImage);

		embed.setImage(comparisonUrls[0]);
		embed.setThumbnail(imageUrls[2]);

		// if the texture doesn't exist yet only include the default/new caption rather than everything
		embed.setFooter({
			text: drawer.urls.length == 3 ? "Reference | New | Current" : "Reference | New",
		});
	} else {
		// image is too big so we just add it directly to the embed without comparison
		const [imageUrl] = await getImages(client, attachment);
		embed.setImage(imageUrl);
		embed.setThumbnail(imageUrl);
		embed.setFooter({ text: "This texture is too big to create a comparison image!" });
	}

	if (param.description) embed.setDescription(param.description);
	if (param.authors.length > 1) embed.fields[0].name = "Authors";

	const msg = await message.channel.send({ embeds: [embed] });

	for (const emojiID of EMOJIS) {
		let e = client.emojis.cache.get(emojiID);
		await msg.react(e);
	}
};
