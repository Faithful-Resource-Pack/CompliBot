const axios = require('axios')
const sizeOf = require('image-size')
const { Buffer } = require('buffer')

/**
 * Get Meta of an image
 * @author Juknum
 * @param {String} imageURL Image URL
 * @returns Promise (resolve)
 */
function getMeta(imageURL) {
	return new Promise(function (resolve, reject) {
		axios.get(imageURL, { responseType: "arraybuffer" })
			.then(response => {
				const data = response.data
				const buf = Buffer.from(data, "base64")
				const size = sizeOf(buf)
				resolve(size)
			})
			.catch(reject)
	})
}

exports.getMeta = getMeta
