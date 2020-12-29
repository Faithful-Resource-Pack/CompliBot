const https    = require('https');
const Canvas   = require('canvas');
const Discord  = require('discord.js');
const sizeOf   = require('image-size');
const settings = require('../settings.js');
const speech   = require('../messages');

module.exports = {
	name: 'magnify',
  aliases: ['zoom', 'scale', 'resize'],
	description: 'Resize an image,\nImage URL needs to end with ``.png`` or ``.jpeg/jpg``,\nMessage ID needs to be from the same channel',
	uses: 'Anyone',
	syntax: `${prefix}magnify <factor> & attach an image\n${prefix}magnify <factor> <Discord message url>\n${prefix}magnify <factor> <image URL>\n${prefix}magnify <factor> <message ID>\n${prefix}magnify <factor> [up/^/last]`,
	async execute(client, message, args) {
		var FACTOR;
		var DATA;

		if (args != '') {

			// <factor>
			if (!isNaN(args[0]) && args[0] > 1) {
				FACTOR = args[0];
			} else return WarnUser('The factor must be greater than 1.')

			// <data>
			// image attached
			if ((args[1] == undefined || args[1] == '') && message.attachments.size > 0) {
				DATA = message.attachments.first().url;
				return magnify(FACTOR, DATA);
			}

			// previous image
			else if ((args[1] == undefined || args[1] == '' || args[1] == 'up' || args[1] == '^' || args[1] == 'last') && message.attachments.size == 0) {
				return PreviousImage(FACTOR);
			}

			// Discord message URL
			else if (args[1].startsWith('https://discord.com/channels')) {
				message.channel.messages.fetch(args[1].split('/').pop()).then(msg => {
					if (msg.attachments.size > 0) {
						DATA = msg.attachments.first().url;
						return magnify(FACTOR, DATA);
					}
					else return WarnUser(`The message from the provided URL does not have any image attached.`);
				}).catch(error => { return WarnUser(error + ' The message URL needs to be from the same channel') });
			}

			// Image URL
			else if (args[1].startsWith('https://') || args[1].startsWith('http://')) {
				if (args[1].endsWith('.png') || args[1].endsWith('.jpeg') || args[1].endsWith('.jpg')) {
					DATA = args[1];
					return magnify(FACTOR, DATA);
				} else return WarnUser(`Image extension is not supported`)
			}

			// Discord message ID
			else if (!isNaN(args[1])) {
				message.channel.messages.fetch(args[1]).then(msg => {
					if (msg.attachments.size > 0) {
						DATA = msg.attachments.first().url;
						return magnify(FACTOR, DATA);
					}
					else return WarnUser(`The message from the provided ID does not have any image attached.`);
				}).catch(error => {
					return WarnUser(error);
				})
			}
		} else return WarnUser(`You did not provide any arguments.`);

		async function PreviousImage(FACTOR) {
			var found = false;
			var messages = [];
			var list_messages = await message.channel.messages.fetch({ limit: 10 });
			messages.push(...list_messages.array());

			for (var i in messages) {
				msg = messages[i]
				if (msg.attachments.size > 0) {
					found = true;
					break;
				}
			}

			if (found) await magnify(FACTOR, msg.attachments.first().url);
			else return WarnUser('No image found in the 10 previous messages.');
		}

		function WarnUser(text) {
			if (!text) text = 'Unknown error';

      var embed = new Discord.MessageEmbed()
	      .setColor(settings.COLOR_RED)
        .setTitle(speech.BOT_ERROR)
        .setDescription(text);

			return message.channel.send(embed)
		}

		//Return Image size, need url.
		function getMeta(imgUrl) {
			return new Promise(function(resolve, reject) {

				https.get(imgUrl, function(response) {
					var chunks = [];
					response.on('data', function(chunk) {
						chunks.push(chunk);
					}).on('end', function() {
						var buffer = Buffer.concat(chunks);
						resolve(sizeOf(buffer));
					});
				}).on('error', function(error) {
					console.error(error);
				});

			});
		}

		function magnify(factor, url) {
			getMeta(url).then(async function(dimension) {

				var sizeOrigin = dimension.width * dimension.height;
				var sizeResult = dimension.width * dimension.height * Math.pow(factor, 2);

				if (sizeOrigin > 262144) return WarnUser('The input picture is too big!');
				if (sizeResult > 1048576) return WarnUser('The output picture will be too big!\nMaximum output allowed: 1024 x 1024 px²\nYours is: ' + dimension.width * factor + ' x ' + dimension.height * factor + ' px²');

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
	}
}