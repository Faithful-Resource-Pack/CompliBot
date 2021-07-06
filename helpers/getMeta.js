const https  = require('https')
const sizeOf = require('image-size')

/**
 * Get Meta of an image
 * @author Juknum
 * @param {String} imageURL Image URL
 * @returns Promise (resolve)
 */
function getMeta(imageURL) {
	return new Promise(function(resolve) {
		https.get(imageURL, function(response) {
			var chunks = []
			response.on('data', function(chunk) {
				chunks.push(chunk)
			}).on('end', function() {
				try {
					var Buffer = require('buffer').Buffer
					resolve(sizeOf(Buffer.concat(chunks)))
				} catch(err) {
					return console.error(err)
				}
			})
		}).on('error', function(error) {
			console.error(error)
		})
	})
}

exports.getMeta = getMeta