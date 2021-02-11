const Canvas   = require('canvas');
const Discord  = require('discord.js');
const colors   = require('../res/colors');

const { getMeta }  = require('./getMeta');
const { warnUser } = require('./warnUser');
const { magnify }  = require('./magnify.js');

function tile(message, url) {
	getMeta(url).then(async function(dimension) {
		var sizeResult = (dimension.width * dimension.height) * 3;
		if (sizeResult > 65536) return warnUser(message,'The output picture will be too big!\nMaximum output allowed: 256 x 256 px²\nYours is: ' + dimension.width * 3 + ' x ' + dimension.height * 3 + ' px²');

    var canvas = Canvas.createCanvas(dimension.width * 3, dimension.height * 3);
    var canvasContext = canvas.getContext('2d');

		const temp = await Canvas.loadImage(url);
    for (var i = 0; i <= 3; i++) {
      for (var j = 0; j <= 3; j++) {
        canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
      }
    }

		const attachment = new Discord.MessageAttachment(canvas.toBuffer());
		var embed = new Discord.MessageEmbed()
			.setColor(colors.BLUE)
			.setTitle('Tiled Texture')
			.setDescription(`Original size: ${dimension.width} x ${dimension.height} px²`)
			.attachFiles([attachment]);

		const embedMessage = await message.channel.send(embed);

    embedMessage.react('🗑️');
	//embedMessage.react('🔎');

		const filter = (reaction, user) => {
			return ['🗑️','🔎'].includes(reaction.emoji.name) && user.id === message.author.id;
		};

		embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first();
				if (reaction.emoji.name === '🗑️') {
					embedMessage.delete();
					message.delete();
				}
				/*TODO: This doesn't work
				if (reaction.emoji.name === '🔎') {
					return magnify(message, 5, embedMessage.attachment.url);
				}*/
			})
			.catch(async () => {
				await embedMessage.reactions.cache.get('🗑️').remove();
				await embedMessage.reactions.cache.get('🔎').remove();
			});
	});
}

exports.tile = tile;
