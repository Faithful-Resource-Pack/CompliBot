const Canvas   = require('canvas');
const Discord  = require('discord.js');
const settings = require('../settings.js');

const { getMeta }  = require('./getMeta');
const { warnUser } = require('./warnUser');

function tile(message, url) {
	getMeta(url).then(async function(dimension) {
		var sizeOrigin = dimension.width * dimension.height;
		var sizeResult = dimension.width * dimension.height * Math.pow(2, 2);

		if (sizeOrigin > 262144) return warnUser(message,'The input picture is too big!');
		if (sizeResult > 1048576) return warnUser(message,'The output picture will be too big!\nMaximum output allowed: 1024 x 1024 px²\nYours is: ' + dimension.width * 2 + ' x ' + dimension.height * 2 + ' px²');

    var canvas = Canvas.createCanvas(dimension.width * 2, dimension.height * 2);
    var canvasContext = canvas.getContext('2d');

		const temp = await Canvas.loadImage(url);
		canvasContext.drawImage(temp, 0, 0);
		canvasContext.drawImage(temp, dimension.width, 0);
		canvasContext.drawImage(temp, dimension.width, dimension.height);
		canvasContext.drawImage(temp, 0, dimension.height);

		const attachment = new Discord.MessageAttachment(canvas.toBuffer());
		var embed = new Discord.MessageEmbed()
			.setColor(settings.COLOR_GREEN)
			.setTitle('Tiled Texture')
			.setDescription(`Original size: ${dimension.width} x ${dimension.height} px²`)
			.attachFiles([attachment]);

		return message.channel.send(embed);
	});
}

exports.tile = tile;
