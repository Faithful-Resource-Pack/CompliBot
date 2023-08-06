const settings = require("../../resources/settings.json");
const DEBUG = process.env.DEBUG.toLowerCase() == "true";

const minecraftSorter = require("../../helpers/minecraftSorter");

const getDimensions = require("../textures/getDimensions");
const getImages = require("../../helpers/getImages");
const generateComparison = require("./generateComparison");
const { imageButtons, submissionButtons } = require("../../helpers/buttons");

const { MessageEmbed, MessageAttachment } = require("discord.js");

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

	// generate displayed paths and uses
	for (let use of uses) {
		const localPath = await use.paths();
		pathText.push(`**${use.editions[0].charAt(0).toUpperCase() + use.editions[0].slice(1)}**\n`);
		for (let path of localPath) {
			const versions = path.versions.sort(minecraftSorter);
			// show range of versions if multiple exist
			// otherwise just push the first one (e.g. bedrock, texture only in one version)
			pathText.push(
				`\`[${
					versions.length > 1 ? `${versions[0]} — ${versions[versions.length - 1]}` : versions[0]
				}]\` ${path.path}\n`,
			);
		}
	}

	const paths = await uses[0].paths();
	const info = {
		path: paths[0].path,
		version: paths[0].versions.sort(minecraftSorter).reverse()[0],
		edition: uses[0].editions[0],
	};

	const embed = new MessageEmbed()
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

	// generate comparison image if possible
	if (dimension.width * dimension.height <= 262144) {
		if (DEBUG) console.log(`Generating comparison image for texture: ${texture.name}`);
		const { comparisonImage, hasReference } = await generateComparison(message, attachment, info);
		const [thumbnailUrl, comparedUrl] = await getImages(client, rawImage, comparisonImage);

		embed.setImage(comparedUrl);
		embed.setThumbnail(thumbnailUrl);

		if (hasReference !== null)
			// if the texture doesn't exist yet only include the default/new caption rather than everything
			embed.setFooter({
				text: hasReference ? "Reference | New | Current" : "Reference | New",
			});
		else embed.setFooter({ text: "Something went wrong fetching the reference texture!" })

		imgButtons = hasReference ? [submissionButtons] : [imageButtons];
	} else {
		if (DEBUG)
			console.log(
				`Texture is too big to generate comparison, loading directly instead: ${texture.name}`,
			);

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
