const sizeOf = require("image-size");

/**
 * Get dimensions of an image
 * @author Juknum
 * @param {String} imageURL Image URL
 * @returns {Promise<{width: Number, height: Number}>}
 */
module.exports = async function getDimensions(imageURL) {
	const response = await fetch(imageURL);
	const data = await response.arrayBuffer();
	const buf = Buffer.from(data, "base64");

	// fixes bug where buf was undefined
	if (!buf) throw new Error(`Buffer for getDimensions invalid: ${buf}`);

	const size = sizeOf(buf);
	return size;
};
