var https   = require('https');
var Canvas  = require('canvas');
var Discord = require('discord.js');
var client  = new Discord.Client();
var sizeOf  = require('image-size');
var settings = require('../settings.js');

module.exports = {
	name: 'magnify',
	description: 'resize an image',
	execute(message, args) {

		var FACTOR;
		var DATA;

		// IMAGE ATTACHED
		if (args != '') {
			if (args > 0 && !isNaN(args) && message.attachments.size > 0) {
				FACTOR = args;
				DATA   = message.attachments.first().url;
				return magnify(FACTOR, DATA);

			}	// NO IMAGE ATTACHED
			else if (args[0] != '' && args[0] > 0 && !isNaN(args[0]) && (args[1] != '' && args[1] != undefined)) {
				FACTOR = args[0];

				// IF URL IS PROVIDED
				if (args[1].startsWith('https://') || args[1].startsWith('http://')) {
					// IF URL IS AN IMAGE
					if (args[1].endsWith('.png') || args[1].endsWith('.jpeg') || args[1].endsWith('.jpg')) {
						DATA = args[1];
						return magnify(FACTOR,DATA);
					// IF URL IS A DISCORD MESSAGE
					} else {
						try {
							client.messages.fetch(args[1].split("/").pop()).then(msg => {
								if (msg.attachments.size > 0) return magnify(FACTOR, msg.attachments.first().url);
								else warnUser();
							});
						} catch (error) { 
              warnUser();
            }
					}

				// IF MESSAGE ID IS PROVIDED
				} else {
					try {
						message.channel.messages.fetch(args[1]).then(msg => {
							if (msg.attachments.size > 0) return magnify(FACTOR, msg.attachments.first().url);
							else warnUser();
						});
					} catch (error)	{
						warnUser();
					}
				}

			} else warnUser()
		} else warnUser()

		function warnUser() {
			const embed = new Discord.MessageEmbed()
				.setTitle('You need to specify 2 arguments:')
				.setColor(settings.C32Color)
				.setThumbnail(settings.C32IMG)
				.setDescription('`/magnify <factor> <message URL/ID>` \nOR: \n`/magnify <factor> <image URL>` \nOR: \n`/magnify <factor> & attach an image`')
				.setFooter('Compliance Team', settings.C32IMG);

			return message.channel.send(embed).then(embed => {
				embed.delete({timeout: 30000});
				message.react('❌'); 
			});
		}

		//Return Image size, need url.
		function getMeta(imgUrl) {
			return new Promise(function(resolve, reject) {

				https.get(imgUrl, function (response) {
					var chunks = [];
					response.on('data', function (chunk) {
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
			getMeta(url).then(async function (dimension) {

				var sizeOrigin = dimension.width * dimension.height;
				var sizeResult = (dimension.width*factor) * (dimension.height*factor);

				if ( sizeOrigin > 262144 ) { // max 512x512
					return message.reply(`Your default picture is already to big, take one tinier, **maximum input allowed: 262 144px² (512x512)**, your: `+sizeOrigin+'px².').then(msg => {
						msg.delete({timeout: 30000});
						message.react('❌');
					});
				} else if ( sizeResult > 1048576 ) { // max 1024x1024 (512 factor 2)
					return message.reply('Your output picture will be too big, **maximum output allowed: 1 048 576px² (1024x1024)**, your: '+sizeResult+'px².').then(msg => {
						msg.delete({timeout: 30000});
						message.react('❌');
					});
				} else {
				
					var canvasStart  = Canvas.createCanvas(dimension.width, dimension.height).getContext('2d');
					var canvasResult = Canvas.createCanvas(dimension.width*factor, dimension.height*factor)
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
							i = (y * dimension.width + x)*4;
							r = image[i];
							g = image[i+1];
							b = image[i+2];
							a = image[i+3];
							canvasResultCTX.fillStyle = 'rgba('+r+','+g+','+b+','+a+')';
							canvasResultCTX.fillRect(x*factor,y*factor,factor,factor);
						}
					}
						
					const attachment = new Discord.MessageAttachment(canvasResult.toBuffer());
					message.channel.send(`Default size: ${dimension.width}x${dimension.height}\n> Magnified by x${factor}:`, attachment);
				}
			});
		}
	}
}