const { get } = require("axios");
const sizeOf = require("image-size");
const { Buffer } = require("buffer");

/**
 * Get dimensions of an image
 * @author Juknum
 * @param {String} imageURL Image URL
 * @returns Promise (resolve)
 */
module.exports = async function getDimensions(imageURL) {
	const response = await get(imageURL, { responseType: "arraybuffer" });
	const data = response.data;
	const buf = Buffer.from(data, "base64");

	// fixes bug where buf was equal to undefined
	if (!buf) throw new Error("Buffer for getDimensions invalid: " + buf);

	const size = sizeOf(buf);
	return size;
};
