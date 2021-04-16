/* eslint-disable no-redeclare */

const GIFEncoder = require('gif-encoder-2')

/**
 * The original function can be found here:
 * https://github.com/benjaminadk/gif-encoder-2/blob/master/src/GIFEncoder.js#L241
 */
class GIFEncoderFixed extends GIFEncoder {
	findClosest(c) {
		return 0
	}

}

module.exports = GIFEncoderFixed