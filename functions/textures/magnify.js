const { createCanvas, loadImage } = require("@napi-rs/canvas");

const { MessageAttachment } = require("discord.js");
const addDeleteReact = require("../../helpers/addDeleteReact");
const getDimensions = require("./getDimensions");

async function magnifyAttachment(url, name = "magnified.png") {
	const dimension = await getDimensions(url);
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

	const tmp = await loadImage(url).catch((err) => {
		console.trace(err);
		return Promise.reject(err);
	});
	canvasResultCTX.imageSmoothingEnabled = false;
	canvasResultCTX.drawImage(tmp, 0, 0, width, height);

	return new MessageAttachment(canvasResult.toBuffer("image/png"), name);
}

/**
 * Magnify image
 * @author Juknum
 * @param {DiscordMessage} message
 * @param {String} url Image URL
 * @returns Send a message with the magnified image
 */
async function magnify(message, url) {
	const attachment = await magnifyAttachment(url);

	const embedMessage = await message.reply({ files: [attachment] });
	await addDeleteReact(embedMessage, message, true);
	return attachment;
}

module.exports = {
	magnify,
	magnifyAttachment,
};
