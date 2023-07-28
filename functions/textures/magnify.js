const { createCanvas, loadImage, Image } = require("@napi-rs/canvas");

const { MessageAttachment } = require("discord.js");
const getDimensions = require("./getDimensions");
const addDeleteButton = require("../../helpers/addDeleteButton");

/**
 * base logic, returns buffer
 * @param {String | Image} origin url to magnify
 * @returns {Promise<Buffer>} buffer for magnified image
 */
async function magnifyBuffer(origin) {
	const tmp = await loadImage(origin).catch((err) => Promise.reject(err));

	const dimension =
		typeof origin == "string"
			? await getDimensions(origin)
			: { width: tmp.width, height: tmp.height };

	let factor = 64;
	const surface = dimension.width * dimension.height;

	if (surface == 256) factor = 32;
	if (surface > 256) factor = 16;
	if (surface > 1024) factor = 8;
	if (surface > 4096) factor = 4;
	if (surface > 65636) factor = 2;
	if (surface > 262144) factor = 1;

	const width = dimension.width * factor;
	const height = dimension.height * factor;
	let canvasResult = createCanvas(width, height);
	let canvasResultCTX = canvasResult.getContext("2d");

	canvasResultCTX.imageSmoothingEnabled = false;
	canvasResultCTX.drawImage(tmp, 0, 0, width, height);
	return { magnified: canvasResult.toBuffer("image/png"), width, height };
}

/**
 * returns discord attachment
 * @param {String | Image} origin url to magnify
 * @param {String?} name name, defaults to "magnified.png"
 * @returns {Promise<MessageAttachment>} magnified file
 */
async function magnifyAttachment(origin, name = "magnified.png") {
	const { magnified } = await magnifyBuffer(origin);
	return new MessageAttachment(magnified, name);
}

/**
 * Sends message with magnified image
 * @author Juknum
 * @param {import("discord.js").Message} message message to reply to
 * @param {String} url
 * @returns {Promise<MessageAttachment>} the attachment that was sent
 */
async function magnify(message, url) {
	const attachment = await magnifyAttachment(url);

	const embedMessage = await message.reply({ files: [attachment] });
	await addDeleteButton(embedMessage);
	return attachment;
}

module.exports = {
	magnify,
	magnifyAttachment,
	magnifyBuffer,
};
