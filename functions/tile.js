const Canvas   = require('canvas');
const Discord  = require('discord.js');
const settings = require('../settings.js');

const { getMeta }  = require('./getMeta');
const { warnUser } = require('./warnUser');
const { magnify }  = require('./magnify.js');

function tile(message, url) {
	getMeta(url).then(async function(dimension) {
		var sizeOrigin = dimension.width * dimension.height;
		var sizeResult = dimension.width * dimension.height * Math.pow(2, 2);

		if (sizeOrigin > 262144) return warnUser(message,'The input picture is too big!');
		if (sizeResult > 1048576) return warnUser(message,'The output picture will be too big!\nMaximum output allowed: 1024 x 1024 px²\nYours is: ' + dimension.width * 3 + ' x ' + dimension.height * 3 + ' px²');

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
			.setColor(settings.COLOR_GREEN)
			.setTitle('Tiled Texture')
			.setDescription(`Original size: ${dimension.width} x ${dimension.height} px²`)
			.attachFiles([attachment]);

		const embedMessage = await message.channel.send(embed);

    await embedMessage.react('🗑️');
		await embedMessage.react('🔎');
		//await embedMessage.react('🌀');
							
		const filter = (reaction, user) => {
			return ['🗑️','🔎'].includes(reaction.emoji.name) && user.id === message.author.id;
		};

    embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
						.then(async collected => {
							const reaction = collected.first();
							if (reaction.emoji.name === '🗑️') {
								await embedMessage.delete();
								await message.delete();
							}
							if (reaction.emoji.name === '🔎') {
								return magnify(message, 5, embedMessage.attachment.url);
								//if (textureSize == '32') return magnify(message, 10, embedMessage.embeds[0].image.url);
							}
							/*if (reaction.emoji.name === '🌀') {
								if (textureSize == '16') return getTexture(32, texture);
								if (textureSize == '32') return getTexture(16, texture);
              }*/
						})	
						.catch(async collected => {
							await embedMessage.reactions.cache.get('🗑️').remove();
							await embedMessage.reactions.cache.get('🔎').remove();
							//await embedMessage.reactions.cache.get('🌀').remove();
						});
	});
}

exports.tile = tile;
