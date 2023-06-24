const axios = require("axios");
const sizeOf = require("image-size");
const { Buffer } = require("buffer");

/**
 * Get Meta of an image
 * @author Juknum
 * @param {String} imageURL Image URL
 * @returns Promise (resolve)
 */
async function getMeta(imageURL) {
	const response = await axios.get(imageURL, { responseType: "arraybuffer" })
	const data = response.data;
	const buf = Buffer.from(data, "base64");

	// fixes bug where buf was equal to undefined
	if (!buf) throw new Error("Buffer for getMeta invalid: " + buf);

	const size = sizeOf(buf);
	return size;
}

exports.getMeta = getMeta;
