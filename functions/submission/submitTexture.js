const settings = require("../../resources/settings.json");
const strings = require("../../resources/strings.json");
const choiceEmbed = require("../../helpers/choiceEmbed");
const getDimensions = require("../textures/getDimensions");
const getImages = require("../../helpers/getImages");
const textures = require("../../helpers/firestorm/texture");
const paths = require("../../helpers/firestorm/texture_paths");
const minecraftSorter = require("../../helpers/minecraftSorter");
const { HorizontalStitcher } = require("../textures/stitch");
const { magnifyAttachment } = require("../textures/magnify");

const { MessageEmbed, MessageAttachment, Permissions } = require("discord.js");

/**
 * Get submission information and create embed
 * @author Juknum, Evorp
 * @param {DiscordClient} client
 * @param {DiscordMessage} message message to check and embed
 */
module.exports = async function submitTexture(client, message) {
	// break if no file is attached
	if (message.attachments.size == 0)
		return invalidSubmission(message, strings.submission.image_not_attached);
	let args = message.content.split(" ");

	// not entirely sure why the first arg exists but it seems to fix problems I had with iterating over maps
	for (let [_, attachment] of message.attachments) {
		// break if it's not a PNG
		if (!attachment.url.endsWith(".png")) {
			invalidSubmission(message, strings.submission.invalid_format);
			continue;
		}
		// get the texture ID
		let id = args
			.filter((el) => el.startsWith("(#") && el.endsWith(")") && !isNaN(el.slice(2).slice(0, -1)))
			.map((el) => el.slice(2).slice(0, -1))[0];

		// take image url to get name of texture
		const search = attachment.url.split("/").slice(-1)[0].replace(".png", "");

		// parameters for the embed
		let param = {
			description: message.content.replace(`(#${id})`, ""),
		};

		/**
		 * CO-AUTHOR DETECTION SYSTEM
		 */

		param.authors = [message.author.id];

		// regex to detect text between curly brackets
		const names = [...message.content.matchAll(/(?<=\{)(.*?)(?=\})/g)].map((i) =>
			i[0].toLowerCase().trim(),
		);

		if (names.length) {
			// fetch all contributors and check if their username matches the one in curly brackets
			const res = await fetch(`https://api.faithfulpack.net/v2/contributions/authors`);
			const contributionJSON = await res.json();
			for (let user of contributionJSON) {
				// if no username set it will throw an error otherwise
				if (!user.username) continue;
				if (names.includes(user.username.toLowerCase())) {
					param.authors.push(user.id);
				}
			}
		}

		// detect by ping (using regex to ensure users not in the server get included)
		const mentions = [...message.content.matchAll(/(?<=\<\@)(.*?)(?=\>)/g)].map((i) => i[0]); // map to only get the first bit
		mentions.forEach((mention) => {
			if (!param.authors.includes(mention)) param.authors.push(mention);
		});

		let results = new Array();

		/**
		 * TEXTURE SEARCHING SYSTEM
		 */

		// priority to ids -> faster
		if (id) {
			let texture = await textures
				.get(id)
				.catch((err) => invalidSubmission(message, strings.submission.unknown_id + err));
			await makeEmbed(client, message, texture, attachment, param);
			continue;
		}

		// if there's no search and no id the submission can't be valid
		if (!search) {
			await invalidSubmission(message, strings.submission.no_name_given);
			continue;
		}

		// partial texture name (_sword, _axe -> diamond_sword, diamond_axe...)
		if (search.startsWith("_") || search.endsWith("_")) {
			results = await textures.search([
				{
					field: "name",
					criteria: "includes",
					value: search,
				},
			]);
		}
		// looking for path + texture (block/stone -> stone)
		else if (search.startsWith("/") || search.endsWith("/")) {
			results = await paths.search([
				{
					field: "path",
					criteria: "includes",
					value: search,
				},
			]);
			// transform paths results into textures
			let output = new Array();
			for (let i = 0; results[i]; i++) {
				let use = await results[i].use();
				output.push(await textures.get(use.textureID));
			}
			results = output;
		}
		// looking for all exact matches (stone -> stone.png)
		else {
			results = await textures.search([
				{
					field: "name",
					criteria: "==",
					value: search,
				},
			]);

			if (!results.length) {
				// no equal result, searching with includes
				results = await textures.search([
					{
						field: "name",
						criteria: "includes",
						value: search,
					},
				]);
			}
		}

		if (!results.length) {
			await invalidSubmission(message, strings.submission.does_not_exist + "\n" + search);
			continue;

		} else if (results.length == 1) {
			await makeEmbed(client, message, results[0], attachment, param);
			continue;
		}

		let choice = [];

		for (let result of results) {
			let uses = await result.uses();
			let paths = await uses[0].paths();
			let version = paths[0].versions.sort(minecraftSorter)[0];

			choice.push(
				`\`[#${result.id}]\` ${result.name
					.replace(search, `**${search}**`)
					.replace(/_/g, "\\_")}\n> \`[${version}+]\` ${paths[0].path
					.replace(search, `**${search}**`)
					.replace(/_/g, "\\_")}`,
			);
		}

		//if (waitEmbedMessage.deletable) await waitEmbedMessage.delete();
		const userChoice = await choiceEmbed(message, {
			title: `${results.length} results, react to choose one!`,
			description: strings.submission.search_description,
			footer: `${message.client.user.username}`,
			propositions: choice,
		}).catch((message, error) => {
			if (process.env.DEBUG) console.error(message, error);
		});

		await makeEmbed(client, message, results[userChoice.index], attachment, param);
	}
	if (message.deletable) await message.delete();
};

const EMOJIS = [settings.emojis.upvote, settings.emojis.downvote, settings.emojis.see_more];

/**
 * Make a submission embed using texture information
 * @author Juknum, Evorp
 * @param {DiscordClient} client
 * @param {DiscordMessage} message used for channel and author information
 * @param {MinecraftTexture} texture texture information
 * @param {MessageAttachment} attachment raw texture to embed
 * @param {Object} param additional info (e.g. description, coauthors)
 */
async function makeEmbed(client, message, texture, attachment, param = new Object()) {
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
}

async function invalidSubmission(message, error = "Not given") {
	// allow managers and council to talk in submit channels
	if (
		message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
		message.member.roles.cache.some((role) => role.name.toLowerCase().includes("council"))
	)
		return;

	try {
		const embed = new MessageEmbed()
			.setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
			.setColor(settings.colors.red)
			.setTitle(strings.submission.autoreact.error_title)
			.setFooter({
				text: strings.submission.autoreact.error_footer,
				iconURL: message.client.user.displayAvatarURL(),
			})
			.setDescription(error);

		const msg = await message.reply({ embeds: [embed] });
		if (msg.deletable) setTimeout(() => msg.delete(), 30000);
		if (message.deletable) setTimeout(() => message.delete(), 30010);
	} catch (error) {
		console.error(error);
	}
}
