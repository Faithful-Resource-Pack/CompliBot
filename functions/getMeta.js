const https    = require('https');
const sizeOf   = require('image-size');

// return img size;
function getMeta(imgUrl) {
	return new Promise(function(resolve, reject) {
		https.get(imgUrl, function(response) {
				var chunks = [];
				response.on('data', function(chunk) {
				chunks.push(chunk);
			}).on('end', function() {
        try {
				  var buffer = Buffer.concat(chunks);
				  resolve(sizeOf(buffer));
        } catch(e) {
          return
        }
			});
		}).on('error', function(error) {
			console.error(error);
		});
	});
}

exports.getMeta = getMeta;