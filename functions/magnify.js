const Canvas   = require('canvas');
const Discord  = require('discord.js');
const settings = require('../settings.js');

const { getMeta }  = require('./getMeta');
const { warnUser } = require('./warnUser');

function magnify(message, factor, url) {
	getMeta(url).then(async function(dimension) {
		var sizeOrigin = dimension.width * dimension.height;
		var sizeResult = dimension.width * dimension.height * Math.pow(factor, 2);

		if (sizeOrigin > 262144) return warnUser(message,'The input picture is too big!');
		if (sizeResult > 1048576) return warnUser(message,'The output picture will be too big!\nMaximum output allowed: 1024 x 1024 px²\nYours is: ' + dimension.width * factor + ' x ' + dimension.height * factor + ' px²');

		var canvasStart = Canvas.createCanvas(dimension.width, dimension.height).getContext('2d');
		var canvasResult = Canvas.createCanvas(dimension.width * factor, dimension.height * factor);
		var canvasResultCTX = canvasResult.getContext('2d');

		const temp = await Canvas.loadImage(url);
		canvasStart.drawImage(temp, 0, 0);

		var image = canvasStart.getImageData(0, 0, dimension.width, dimension.height).data;

		var i;
		var r;
		var g;
		var b;
		var a;

		for (var x = 0; x < dimension.width; x++) {
			for (var y = 0; y < dimension.height; y++) {
				i = (y * dimension.width + x) * 4;
				r = image[i];
				g = image[i + 1];
				b = image[i + 2];
				a = image[i + 3];
				canvasResultCTX.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
				canvasResultCTX.fillRect(x * factor, y * factor, factor, factor);
			}
		}

		const attachment = new Discord.MessageAttachment(canvasResult.toBuffer());
		var embed = new Discord.MessageEmbed()
			.setColor(settings.COLOR_GREEN)
			.setTitle(`Magnified by ${factor}x`)
			.setDescription(`Original size: ${dimension.width} x ${dimension.height} px²\nNew size: ${dimension.width * factor} x ${dimension.height * factor} px²`)
			.attachFiles([attachment]);

		return message.channel.send(embed);
	});
}

exports.magnify = magnify;