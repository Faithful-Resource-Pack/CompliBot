const { createCanvas, loadImage } = require("@napi-rs/canvas");
const getDimensions = require("./getDimensions");

/**
 * Tile an image
 * @author Juknum
 * @param {DiscordInteraction} interaction
 * @param {String} url Image url
 * @param {String?} type Type of tiling, could be: grid, horizontal, round or plus
 * @returns tiled image as a buffer
 */
module.exports = async function tile(interaction, url, type = "grid") {
	const dimension = await getDimensions(url);
	// aliases of type
	if (type == undefined || type == "g") type = "grid";
	if (type == "v") type = "vertical";
	if (type == "h") type = "horizontal";
	if (type == "r") type = "round";
	if (type == "p") type = "plus";

	const sizeResult = dimension.width * dimension.height * 3;
	if (sizeResult > 262144) {
		interaction.reply({
			content:
				"The output picture will be too big!\nMaximum output allowed: 512 x 512 px²\nYours is: " +
				dimension.width * 3 +
				" x " +
				dimension.height * 3 +
				" px²",
			ephemeral: true,
		});
		return null;
	}

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

	return canvas.toBuffer("image/png");
};
