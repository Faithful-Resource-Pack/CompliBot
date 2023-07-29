const settings = require("../../resources/settings.json");
const strings = require("../../resources/strings.json");
const DEBUG = process.env.DEBUG.toLowerCase() == "true";

const choiceEmbed = require("./choiceEmbed");
const makeEmbed = require("./makeEmbed");
const addDeleteButton = require("../../helpers/addDeleteButton");

const textures = require("../../helpers/firestorm/texture");
const getTexture = require("../../helpers/getTexture");
const getAuthors = require("./getAuthors");
const minecraftSorter = require("../../helpers/minecraftSorter");

const { MessageEmbed, Permissions } = require("discord.js");

/**
 * Get submission information and create embed
 * @author Juknum, Evorp
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").Message} message message to check and embed
 */
module.exports = async function submitTexture(client, message) {
	// break if no file is attached
	if (!message.attachments.size)
		return invalidSubmission(message, strings.submission.image_not_attached);

	// needs to be set to -1 since we initialize it to zero directly after
	let attachmentIndex = -1;
	let ongoingMenu;
	for (let attachment of message.attachments.values()) {
		// need to update index here since it can skip loops early otherwise
		++attachmentIndex;

		if (DEBUG) console.log("Texture submitted");

		if (!attachment.url.endsWith(".png")) {
			invalidSubmission(message, strings.submission.invalid_format);
			continue;
		}

		// try and get the texture id from the message contents
		const id = (message.content.match(/(?<=\[\#)(.*?)(?=\])/) ?? ["NO ID FOUND"])[0];

		// get authors and description for embed
		const param = {
			description: message.content.replace(`[#${id}]`, ""),
			authors: await getAuthors(message),
		};

		// priority to ids -> faster
		if (!isNaN(Number(id))) {
			const texture = await textures
				.get(id)
				.catch((err) => invalidSubmission(message, strings.submission.unknown_id + err));
			await makeEmbed(client, message, texture, attachment, param);
			continue;
		}

		// if there's no id, take image url to get name of texture
		const search = attachment.url.split("/").slice(-1)[0].replace(".png", "");

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

		ongoingMenu = true;
		let mappedResults = [];
		for (let result of results) {
			const uses = await result.uses();
			const paths = await uses[0].paths();
			const version = paths[0].versions.sort(minecraftSorter).reverse()[0];

			mappedResults.push({
				label: `[#${result.id}] (${version}) ${result.name}`,
				description: paths[0].path,
				value: `${result.id}__${attachmentIndex}`,
			});
		}

		await choiceEmbed(message, mappedResults);
	}
	if (!ongoingMenu && message.deletable) await message.delete();
};

/**
 * Logic for handling an invalid submission
 * @author Juknum
 * @param {import("discord.js").Message} message message to check permissions of
 * @param {String?} error optional error message
 */
async function invalidSubmission(message, error = "Not given") {
	if (DEBUG) console.log(`Submission cancelled with reason: ${error}`);
	// allow managers and council to talk in submit channels
	if (
		(message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
			message.member.roles.cache.some((role) => role.name.toLowerCase().includes("council"))) &&
		error == strings.submission.image_not_attached
	)
		return;

	const embed = new MessageEmbed()
		.setColor(settings.colors.red)
		.setTitle(strings.submission.autoreact.error_title)
		.setThumbnail(settings.images.warning)
		.setDescription(error)
		.setFooter({
			text: strings.submission.autoreact.error_footer,
			iconURL: message.client.user.displayAvatarURL(),
		});

	try {
		let msg;
		if (message.deletable) {
			msg = await message.reply({ embeds: [embed] });
			setTimeout(() => message.delete(), 30010);
		} else msg = await message.channel.send({ embeds: [embed] });
		if (msg.deletable) {
			addDeleteButton(msg);
			setTimeout(() => msg.delete(), 30000);
		}
	} catch {
		// message deleted before timeout or there's no author message
	}
}
