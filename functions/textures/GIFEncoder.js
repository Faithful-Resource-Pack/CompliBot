const GIFEncoder = require("gif-encoder-2");

/**
 * The original function can be found here:
 * https://github.com/benjaminadk/gif-encoder-2/blob/master/src/GIFEncoder.js#L241
 */
module.exports = class GIFEncoderFixed extends GIFEncoder {
	findClosest(c) {
		return 0;
	}
};
