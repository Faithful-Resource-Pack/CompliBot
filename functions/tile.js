const Canvas   = require('canvas');
const Discord  = require('discord.js');
const colors   = require('../res/colors');

const { getMeta }  = require('./getMeta');
const { warnUser } = require('./warnUser');
const { magnify }  = require('./magnify.js');

function tile(message, url, type) {
	getMeta(url).then(async function(dimension) {
		if (type == undefined || type == 'g') type = 'grid';
		if (type =='v') type = 'vertical';
		if (type == 'h') type = 'horizontal';
		if (type == 'r') type = 'round';
		if (type == 'p') type = 'plus';

		var sizeResult = (dimension.width * dimension.height) * 3;
		if (sizeResult > 262144) return warnUser(message,'The output picture will be too big!\nMaximum output allowed: 512 x 512 px²\nYours is: ' + dimension.width * 3 + ' x ' + dimension.height * 3 + ' px²');
		
		if (type == 'grid') {
			var canvas = Canvas.createCanvas(dimension.width * 3, dimension.height * 3);
			var canvasContext = canvas.getContext('2d');

			const temp = await Canvas.loadImage(url);
			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
				}
			}
		}

		else if (type == 'vertical') {
			var canvas = Canvas.createCanvas(dimension.width, dimension.height * 3);
			var canvasContext = canvas.getContext('2d');

			const temp = await Canvas.loadImage(url);
			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
				}
			}
		}

		else if (type == 'horizontal') {
			var canvas = Canvas.createCanvas(dimension.width * 3, dimension.height);
			var canvasContext = canvas.getContext('2d');

			const temp = await Canvas.loadImage(url);
			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
				}
			}
		}

		else if (type == 'round') {
			var canvas = Canvas.createCanvas(dimension.width * 3, dimension.height * 3);
			var canvasContext = canvas.getContext('2d');

			const temp = await Canvas.loadImage(url);
			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
				}
			}
			canvasContext.clearRect(dimension.width, dimension.height, dimension.width, dimension.height);
		}

		else if (type == 'plus') {
			var canvas = Canvas.createCanvas(dimension.width * 3, dimension.height * 3);
			var canvasContext = canvas.getContext('2d');

			const temp = await Canvas.loadImage(url);
			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					canvasContext.drawImage(temp, i * dimension.width, j * dimension.height);
				}
			}
			canvasContext.clearRect(0, 0, dimension.width, dimension.height); // top left
			canvasContext.clearRect(dimension.width * 2, 0, dimension.width, dimension.height); // top right
			canvasContext.clearRect(dimension.width * 2, dimension.height * 2, dimension.width, dimension.height); // bottom right
			canvasContext.clearRect(0, dimension.height * 2, dimension.width, dimension.height); // bottom left
		}

		const attachment = new Discord.MessageAttachment(canvas.toBuffer());
		var embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setColor(colors.BLUE)
			.setTitle(`Tiled texture (${type})`)
			.setDescription(`Original size: ${dimension.width} x ${dimension.height} px²`)
			.attachFiles([attachment]);

		const embedMessage = await message.inlineReply(embed);

    if (message.channel.type != 'dm') await embedMessage.react('🗑️');

		const filter = (reaction, user) => {
			return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
		};

		embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first();
				if (reaction.emoji.name === '🗑️') {
					embedMessage.delete();
					if (!message.deleted) message.delete();
				}
			})
			.catch(async () => {
				if (message.channel.type != 'dm') await embedMessage.reactions.cache.get('🗑️').remove();
			});
	});
}

exports.tile = tile;
