const { createCanvas, loadImage } = require("@napi-rs/canvas");

const { MessageAttachment } = require("discord.js");
const getDimensions = require("./getDimensions");
const addDeleteButton = require("../../helpers/addDeleteButton");

async function magnifyAttachment(origin, name = "magnified.png") {
	let dimension;

	const tmp = await loadImage(origin).catch((err) => {
		console.trace(err);
		return Promise.reject(err);
	});

	if (typeof origin == "string") {
		dimension = await getDimensions(origin);
	} else {
		dimension = { width: tmp.width, height: tmp.height };
	}

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
	await addDeleteButton(embedMessage);
	return attachment;
}

module.exports = {
	magnify,
	magnifyAttachment,
};
