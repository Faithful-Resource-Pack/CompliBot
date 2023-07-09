const settings = require("../../resources/settings.json");
const strings = require("../../resources/strings.json");
const choiceEmbed = require("../../helpers/choiceEmbed");
const textures = require("../../helpers/firestorm/texture");
const getTexture = require("../../helpers/getTexture");
const minecraftSorter = require("../../helpers/minecraftSorter");
const makeEmbed = require("./makeEmbed");

const { MessageEmbed, Permissions } = require("discord.js");

/**
 * Get submission information and create embed
 * @author Juknum, Evorp
 * @param {DiscordClient} client
 * @param {DiscordMessage} message message to check and embed
 */
module.exports = async function submitTexture(client, message) {
	// break if no file is attached
	if (!message.attachments.size)
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

		// get authors and description for embed
		let param = {
			description: message.content.replace(`(#${id})`, ""),
			authors: await getAuthors(message),
		};

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

		const results = await getTexture(search);

		if (!results.length) {
			await invalidSubmission(message, strings.submission.does_not_exist + "\n" + search);
			continue;
		} else if (results.length == 1) {
			await makeEmbed(client, message, results[0], attachment, param);
			continue;
		}

		// create choice embed if multiple textures
		let choice = [];
		for (let result of results) {
			let uses = await result.uses();
			let paths = await uses[0].paths();
			let version = paths[0].versions.sort(minecraftSorter)[0];

			choice.push(
				`**[#${result.id}] ${result.name
					.replace(search, `${search}`)
					.replace(/_/g, "\\_")}**\n> \`[${version}+]\` ${paths[0].path
					.replace(search, `**${search}**`)
					.replace(/_/g, "\\_")}`,
			);
		}

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
	// once all textures in image are done iterating the message is "safe" to delete
	// since the choiceEmbed relies on the original message not being deleted
	if (message.deletable) await message.delete();
};

/**
 * Detects co-authors from pings and curly bracket syntax in a given message
 * @author Evorp
 * @param {DiscordMessage} message
 * @returns array of author's discord IDs
 */
async function getAuthors(message) {
	let authors = [message.author.id];

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

			if (names.includes(user.username.toLowerCase()) && !authors.includes(user.id))
				authors.push(user.id);
		}
	}

	// detect by ping (using regex to ensure users not in the server get included)
	const mentions = [...message.content.matchAll(/(?<=\<\@)(.*?)(?=\>)/g)].map((i) => i[0]); // map to only get the first bit
	mentions.forEach((mention) => {
		if (!authors.includes(mention)) authors.push(mention);
	});

	return authors;
}

/**
 * Logic for handling an invalid submission
 * @author Juknum
 * @param {DiscordMessage} message message to check permissions of
 * @param {String?} error optional error message
 */
async function invalidSubmission(message, error = "Not given") {
	// allow managers and council to talk in submit channels
	if (
		(message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
			message.member.roles.cache.some((role) => role.name.toLowerCase().includes("council"))) &&
		error == strings.submission.image_not_attached
	)
		return;

	try {
		// TODO: when discord finishes name migration remove this code and just use message.author.username everywhere
		const authorName =
			message.author.discriminator == 0 ? `@${message.author.username}` : message.author.tag;
		const embed = new MessageEmbed()
			.setAuthor({ name: authorName, iconURL: message.author.displayAvatarURL() })
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
