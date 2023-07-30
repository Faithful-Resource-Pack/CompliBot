const settings = require("../../resources/settings.json");
const DEBUG = process.env.DEBUG.toLowerCase() == "true";

const minecraftSorter = require("../../helpers/minecraftSorter");
const getImages = require("../../helpers/getImages");
const { imageButtons, submissionButtons } = require("../../helpers/buttons");
const getDimensions = require("../textures/getDimensions");
const stitch = require("../textures/stitch");
const { magnifyBuffer, magnifyAttachment } = require("../textures/magnify");

const { MessageEmbed, MessageAttachment } = require("discord.js");
const { loadImage } = require("@napi-rs/canvas");

/**
 * Make a submission embed using existing texture information
 * @author Juknum, Evorp
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").Message} message used for channel and author information
 * @param {import("../../helpers/getTexture").MinecraftTexture} texture texture information
 * @param {import("discord.js").MessageAttachment} attachment raw texture to embed
 * @param {{ description: String?, authors: String[] }} param additional info (e.g. description, coauthors)
 */
module.exports = async function makeEmbed(
	client,
	message,
	texture,
	attachment,
	param = new Object(),
) {
	/** @type {import("../../helpers/firestorm/texture_use.js").TextureUse[]} */
	const uses = await texture.uses();
	let pathText = [];
	let imgButtons;

	for (let use of uses) {
		const localPath = await use.paths();
		pathText.push(`**${use.editions[0].charAt(0).toUpperCase() + use.editions[0].slice(1)}**\n`);
		for (let path of localPath) {
			const versions = path.versions.sort(minecraftSorter);
			pathText.push(`\`[${versions[0]}+]\` ${path.path}\n`);
		}
	}

	const paths = await uses[0].paths();
	const info = {
		path: paths[0].path,
		version: paths[0].versions.sort(minecraftSorter).reverse()[0],
		edition: uses[0].editions[0],
	};

	const embed = new MessageEmbed()
		// TODO: add a Faithful gallery url that shows all textures by a given author
		.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
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
	const dimension = await getDimensions(attachment.url);

	/**
	 * COMPARISON IMAGE GENERATOR
	 * should probably be its own function but oh well
	 */
	if (dimension.width * dimension.height <= 262144) {
		if (DEBUG) console.log(`Generating comparison image for texture: ${texture.name}`);

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
		const upscaledImage = await loadImage(attachment.url);
		let defaultImage;

		// load images necessary to generate comparison
		try {
			defaultImage = await loadImage(
				`${defaultRepo[info.edition.toLowerCase()]}${info.version}/${info.path}`,
			);
		} catch {
			// reference texture doesn't exist so we use the default repo
			defaultImage = await loadImage(
				`${settings.repositories.raw.default[info.edition.toLowerCase()]}${info.version}/${
					info.path
				}`,
			);
		}

		/** @type {import("@napi-rs/canvas").Image[] */
		let images = [defaultImage, upscaledImage];

		try {
			const currentImage = await loadImage(
				`${settings.repositories.raw[repoKey][info.edition.toLowerCase()]}${info.version}/${
					info.path
				}`,
			);
			images.push(currentImage);
			imgButtons = [submissionButtons];
		} catch {
			// texture being submitted is a new texture, so there's nothing to compare against
			imgButtons = [imageButtons];
		}

		const stitched = await stitch(images);

		// generate comparison and add to embed
		const comparisonImage = await magnifyAttachment(stitched, "compared.png");
		const [thumbnailUrl, comparedUrl] = await getImages(client, rawImage, comparisonImage);

		embed.setImage(comparedUrl);
		embed.setThumbnail(thumbnailUrl);

		// if the texture doesn't exist yet only include the default/new caption rather than everything
		embed.setFooter({
			text: images.length == 3 ? "Reference | New | Current" : "Reference | New",
		});
	} else {
		// image is too big so we just add it directly to the embed without comparison
		const [imageUrl] = await getImages(client, attachment);
		embed
			.setImage(imageUrl)
			.setThumbnail(imageUrl)
			.setFooter({ text: "This texture is too big to create a comparison image!" });

		imgButtons = [imageButtons];
	}

	if (param.description) embed.setDescription(param.description);
	if (param.authors.length > 1) embed.fields[0].name = "Authors";

	const msg = await message.channel.send({
		embeds: [embed],
		components: imgButtons,
	});

	for (const emojiID of [
		settings.emojis.upvote,
		settings.emojis.downvote,
		settings.emojis.see_more,
	]) {
		const e = client.emojis.cache.get(emojiID);
		await msg.react(e);
	}

	if (DEBUG) console.log(`Finished submission embed for texture: ${texture.name}`);
};
