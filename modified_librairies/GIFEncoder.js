/* eslint-disable no-redeclare */

const NeuQuant = require('../node_modules/gif-encoder-2/src/TypedNeuQuant.js')
const { OctreeQuant, Color } = require('../node_modules/gif-encoder-2/src/OctreeQuant')
const GIFEncoder = require('gif-encoder-2')

// because the classic stuff is fucked up
class GIFEncoderFixed extends GIFEncoder {
	findClosest(c) {
		return 0
	}

}

module.exports = GIFEncoderFixed