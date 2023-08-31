const settings = require("@resources/settings.json");
const strings = require("@resources/strings.json");

const DEBUG = process.env.DEBUG.toLowerCase() == "true";

const choiceEmbed = require("./utility/choiceEmbed");
const makeEmbed = require("./makeEmbed");
const addDeleteButton = require("@helpers/addDeleteButton");

const getAuthors = require("./utility/getAuthors");
const minecraftSorter = require("@helpers/minecraftSorter");

const { MessageEmbed, Permissions } = require("discord.js");
const { default: axios } = require("axios");

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

		if (DEBUG)
			console.log(`Texture submitted: ${attachmentIndex + 1} of ${message.attachments.size}`);

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
			/** @type {import("../../helpers/jsdoc").Texture} */
			const texture = (await axios.get(`https://api.faithfulpack.net/v2/textures/${id}/all`)).data;
			if (!Object.keys(texture).length)
				await invalidSubmission(message, strings.submission.unknown_id + err);
			else await makeEmbed(client, message, texture, attachment, param);
			continue;
		}

		// if there's no id, take image url to get name of texture
		const search = attachment.url.split("/").slice(-1)[0].replace(".png", "");

		// if there's no search and no id the submission can't be valid
		if (!search) {
			await invalidSubmission(message, strings.submission.no_name_given);
			continue;
		}

		/** @type {import("../../helpers/jsdoc").Texture[]} */
		const results = (await axios.get(`https://api.faithfulpack.net/v2/textures/${search}/all`)).data;

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
			const version = result.paths[0].versions.sort(minecraftSorter).reverse()[0];

			mappedResults.push({
				label: `[#${result.id}] (${version}) ${result.name}`,
				description: result.paths[0].name,
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
	// allow managers and council to talk in submit channels
	if (
		(message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
			message.member.roles.cache.some((role) => role.name.toLowerCase().includes("council"))) &&
		error == strings.submission.image_not_attached
	)
		return;

	if (DEBUG) console.log(`Submission cancelled with reason: ${error}`);

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
		const msg = message.deletable
			? await message.reply({ embeds: [embed] })
			: await message.channel.send({ embeds: [embed] });

		if (msg.deletable) addDeleteButton(msg);

		setTimeout(() => {
			if (msg.deletable) msg.delete();
			if (message.deletable) message.delete();
		}, 30000);
	} catch {
		// message couldn't be deleted
	}
}
