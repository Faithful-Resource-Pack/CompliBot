const settings = require("../../resources/settings.json");
const DEBUG = process.env.DEBUG.toLowerCase() == "true";

const minecraftSorter = require("../../helpers/minecraftSorter");

const getPackByChannel = require("./getPackByChannel");
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
 * @param {import("../../helpers/jsdoc").Texture} texture texture information
 * @param {import("discord.js").MessageAttachment} attachment raw texture to embed
 * @param {{ description: String?, authors: String[] }} param additional info (e.g. description, coauthors)
 */
module.exports = async function makeEmbed(client, message, texture, attachment, param = {}) {
	const packName = await getPackByChannel(message.channel.id, "submit");
	let imgButtons;

	// load previous contributions if applicable
	if (param.description.startsWith("+")) {
		const allContributions = texture.contributions.filter((i) => i.pack == packName);
		if (allContributions.length) {
			const lastContribution = allContributions.sort((a, b) => (a.date > b.date ? -1 : 1))[0];
			for (let author of lastContribution.authors)
				if (!param.authors.includes(author)) param.authors.push(author);
		}
	}

	const embed = new MessageEmbed()
		.setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
		.setColor(settings.colors.blue)
		.setTitle(`[#${texture.id}] ${texture.name}`)
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${texture.id}`)
		.addFields([
			{ name: "Author", value: `<@!${param.authors.join(">\n<@!").toString()}>`, inline: true },
			{ name: "Status", value: `<:pending:${settings.emojis.pending}> Pending...`, inline: true },
			...addPathsToEmbed(texture),
		]);

	// load raw image to pull from
	const rawImage = new MessageAttachment(attachment.url, `${texture.name}.png`);
	const dimension = await getDimensions(attachment.url);

	// generate comparison image if possible
	if (dimension.width * dimension.height <= 262144) {
		if (DEBUG) console.log(`Generating comparison image for texture: ${texture.name}`);
		const { comparisonImage, hasReference } = await generateComparison(packName, attachment, {
			path: texture.paths[0].name,
			version: texture.paths[0].versions.sort(minecraftSorter).reverse()[0],
			edition: texture.uses[0].edition.toLowerCase(),
		});
		// send to #submission-spam for permanent urls
		const [thumbnailUrl, comparedUrl] = await getImages(client, rawImage, comparisonImage);

		embed.setImage(comparedUrl);
		embed.setThumbnail(thumbnailUrl);

		/**
		 * hasReference has three states:
		 * null if reference checking failed,
		 * false if no current texture exists,
		 * true if all three exist
		 */
		if (hasReference !== null)
			embed.setFooter({
				text: hasReference ? "Reference | New | Current" : "Reference | New",
			});
		else {
			embed.setFooter({ text: "Something went wrong fetching the reference texture!" });
			embed.setColor(settings.colors.red);
		}

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
	])
		await msg.react(client.emojis.cache.get(emojiID));

	if (DEBUG) console.log(`Finished submission embed for texture: ${texture.name}`);
};

/**
 * Return organized path data for a given texture
 * @param {import("../../helpers/jsdoc").Texture} texture
 * @returns {import("discord.js").EmbedFieldData[]}
 */
function addPathsToEmbed(texture) {
	let tmp = {};
	texture.uses.forEach((use) => {
		texture.paths
			.filter((el) => el.use === use.id)
			.forEach((p) => {
				const versions = p.versions.sort(minecraftSorter);
				const versionRange = `\`[${
					versions.length > 1 ? `${versions[0]} — ${versions[versions.length - 1]}` : versions[0]
				}]\``;
				const formatted = `${versionRange} ${p.name}`;
				if (tmp[use.edition]) tmp[use.edition].push(formatted);
				else tmp[use.edition] = [formatted];
			});
	});

	let final = [];

	Object.keys(tmp).forEach((edition) => {
		if (tmp[edition].length > 0) {
			final.push({
				name: edition.charAt(0).toLocaleUpperCase() + edition.slice(1),
				value: tmp[edition].join("\n"),
			});
		}
	});

	return final;
}
