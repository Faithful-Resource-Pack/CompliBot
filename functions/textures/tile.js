const { createCanvas, loadImage } = require("canvas");
const settings = require("../../resources/settings.json");

const { MessageAttachment } = require("discord.js");
const addDeleteReact = require("../../helpers/addDeleteReact");
const getMeta = require("./getMeta");
const warnUser = require("../../helpers/warnUser");
const { magnify } = require("./magnify");
const sendAttachment = require("./sendAttachment");

/**
 * Tile an image
 * @author Juknum
 * @param {DiscordMessage} message
 * @param {String} url Image url
 * @param {String} type Type of tiling, could be: grid, horizontal, round or plus
 * @param {DiscordUserID} userID if set, the message is send to the corresponding #bot-commands
 * @returns Send an embed message with the tiled image
 */
module.exports = async function tile(message, url, type, userID) {
	const dimension = await getMeta(url);
	// aliases of type
	if (type == undefined || type == "g") type = "grid";
	if (type == "v") type = "vertical";
	if (type == "h") type = "horizontal";
	if (type == "r") type = "round";
	if (type == "p") type = "plus";

	const sizeResult = dimension.width * dimension.height * 3;
	if (sizeResult > 262144)
		return warnUser(
			message,
			"The output picture will be too big!\nMaximum output allowed: 512 x 512 px²\nYours is: " +
				dimension.width * 3 +
				" x " +
				dimension.height * 3 +
				" px²",
		);

	let canvas;
	let canvasContext;
	let i, j;

	/**
	 * Follows this pattern:
	 *  x x x
	 *  x x x
	 *  x x x
	 */
	if (type == "grid") {
		canvas = createCanvas(dimension.width * 3, dimension.height * 3);
		canvasContext = canvas.getContext("2d");

		const temp = await loadImage(url);
		for (i = 0; i < 3; i++) {
			for (j = 0; j < 3; j++) {
				canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
			}
		}
	} else if (type == "vertical") {
		/**
		 * Follows this pattern:
		 *  . x .
		 *  . x .
		 *  . x .
		 */
		canvas = createCanvas(dimension.width, dimension.height * 3);
		canvasContext = canvas.getContext("2d");

		const temp = await loadImage(url);
		for (i = 0; i < 3; i++) {
			for (j = 0; j < 3; j++) {
				canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
			}
		}
	} else if (type == "horizontal") {
		/**
		 * Follows this pattern:
		 *  . . .
		 *  x x x
		 *  . . .
		 */
		canvas = createCanvas(dimension.width * 3, dimension.height);
		canvasContext = canvas.getContext("2d");

		const temp = await loadImage(url);
		for (i = 0; i < 3; i++) {
			for (j = 0; j < 3; j++) {
				canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
			}
		}
	} else if (type == "round") {
		/**
		 * Follows this pattern:
		 *  x x x
		 *  x . x
		 *  x x x
		 */
		canvas = createCanvas(dimension.width * 3, dimension.height * 3);
		canvasContext = canvas.getContext("2d");

		const temp = await loadImage(url);
		for (i = 0; i < 3; i++) {
			for (j = 0; j < 3; j++) {
				canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
			}
		}
		canvasContext.clearRect(dimension.width, dimension.height, dimension.width, dimension.height);
	} else if (type == "plus") {
		/**
		 * Follows this pattern:
		 *  . x .
		 *  x x x
		 *  . x .
		 */
		canvas = createCanvas(dimension.width * 3, dimension.height * 3);
		canvasContext = canvas.getContext("2d");

		const temp = await loadImage(url);
		for (i = 0; i < 3; i++) {
			for (j = 0; j < 3; j++) {
				canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
			}
		}
		canvasContext.clearRect(0, 0, dimension.width, dimension.height); // top left
		canvasContext.clearRect(dimension.width * 2, 0, dimension.width, dimension.height); // top right
		canvasContext.clearRect(
			dimension.width * 2,
			dimension.height * 2,
			dimension.width,
			dimension.height,
		); // bottom right
		canvasContext.clearRect(0, dimension.height * 2, dimension.width, dimension.height); // bottom left
	}

	const attachment = new MessageAttachment(canvas.toBuffer(), "tiled.png");

	let embedMessage;
	if (userID) embedMessage = await sendAttachment(message, attachment, userID);
	else {
		embedMessage = await message.reply({ files: [attachment] });
		addDeleteReact(embedMessage, message, true);
	}

	if (dimension.width <= 512 && dimension.height <= 512) {
		// avoid an issue that also makes the bot magnify its own image in DMs
		// probably unfixable due to the texture submission reactions
		if (embedMessage.channel.type === "DM") return;

		embedMessage.react(settings.emojis.magnify);

		const filter = (reaction, user) => {
			if (redirectMessage)
				return (
					[settings.emojis.magnify].includes(reaction.emoji.id) &&
					user.id === redirectMessage.author.id
				);
			else
				return (
					[settings.emojis.magnify].includes(reaction.emoji.id) && user.id === message.author.id
				);
		};

		try {
			const collected = await embedMessage.awaitReactions({
				filter,
				max: 1,
				time: 60000,
				errors: ["time"],
			});
			const reaction = collected.first();
			if (reaction.emoji.id === settings.emojis.magnify) {
				if (redirectMessage)
					return magnify(
						embedMessage,
						embedMessage.attachments.first().url,
						undefined,
						redirectMessage,
					);
				else return magnify(embedMessage, embedMessage.attachments.first().url);
			}
		} catch {
			try {
				await embedMessage.reactions.cache.get(settings.emojis.magnify).remove();
			} catch (err) {
				/* Message already deleted */
			}
		}
	}
};
