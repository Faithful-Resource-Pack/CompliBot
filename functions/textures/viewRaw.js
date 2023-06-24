const addDeleteReact = require("../../helpers/addDeleteReact");
const sendAttachment = require("./sendAttachment");

/**
 * Sends raw image
 * @author Evorp
 * @param {DiscordMessage} message
 * @param {String} url Image URL
 * @param {DiscordUserID} userID if set, the message is send to the corresponding #complibot
 * @returns Send a message with the raw image
 */
module.exports = async function viewRaw(message, url, userID) {
	const attachment = url;
	if (userID) await sendAttachment(message, attachment, userID);
	else {
		const embedMessage = await message.reply({ files: [attachment] });
		await addDeleteReact(embedMessage, message, true);
	}

	return attachment;
};
