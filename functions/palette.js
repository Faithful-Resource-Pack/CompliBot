const Canvas   = require('canvas');
const Discord  = require('discord.js');
const colors   = require('../res/colors');

const { getMeta }  = require('./getMeta');

async function palette(message, url) {
	getMeta(url).then(async function(dimension) {
		var canvas = Canvas.createCanvas(dimension.width, dimension.height).getContext('2d');
		var colorsHEX   = [];
		var colorsRGBA  = [];
		var colorsAlpha = [];

		const temp = await Canvas.loadImage(url);
		canvas.drawImage(temp, 0, 0);

		var image = canvas.getImageData(0, 0, dimension.width, dimension.height).data;

		var i = undefined;
		var r = undefined;
		var g = undefined;
		var b = undefined;
		var a = undefined;

		for (var x = 0; x < dimension.width; x++) {
			for (var y = 0; y < dimension.height; y++) {
				i = (y * dimension.width + x) * 4;
				r = image[i];
				g = image[i + 1];
				b = image[i + 2];
				a = image[i + 3];

				var hex = rgbToHex(r,g,b);
				if (!colorsRGBA.includes(`rgba(${r},${g},${b},${a})`)) {
					colorsRGBA.push(`rgba(${r},${g},${b},${a})`);
					colorsHEX.push(hex);
			  	colorsAlpha.push(`${a}, ${(a | 1 << 8).toString(16).slice(1)}`);
				}
				
			}
		}

		var embed = new Discord.MessageEmbed()
			.setColor(colors.BLUE)
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(`List of colors:\n`)
			.setFooter(`Total: ${colorsHEX.length}`);

		var colorsHEXText  = '';
		var colorsAlphaText = '';

		for (var i = 0; i < colorsHEX.length; i++) {
			if (i < 26) {
				colorsHEXText  += `[\`#${colorsHEX[i]}\`](https://coolors.co/${colorsHEX[i]})\n`;
				colorsAlphaText += `\`${colorsAlpha[i]}\`\n`;
			} else {
				colorsAlphaText += '**...**';
				colorsHEXText += '**...**';
				break;
			}
		}

		embed.addFields(
			{ name: "Hex:",  value: colorsHEXText,  inline: true },
			{ name: "Alpha:", value: colorsAlphaText, inline: true }
		);
		
		var URLs = [`https://coolors.co/`,`https://coolors.co/`,`https://coolors.co/`,`https://coolors.co/`];
		for (var i = 0; i < colorsHEX.length; i++) {
			if (i <= 9) {
				if (colorsHEX[i].length == 6) URLs[0] += colorsHEX[i] + '-';
				else URLs[0] += colorsHEX[i].slice(0, -2) + '-';
			}
			if (i > 9 && i <= 18) {
				if (colorsHEX[i].length == 6) URLs[1] += colorsHEX[i] + '-';
				else URLs[1] += colorsHEX[i].slice(0, -2) + '-';
			}
			if (i > 18 && i <= 27) {
				if (colorsHEX[i].length == 6) URLs[2] += colorsHEX[i] + '-';
				else URLs[2] += colorsHEX[i].slice(0, -2) + '-';
			}
			if (i > 27 && i <= 36) {
				if (colorsHEX[i].length == 6) URLs[3] += colorsHEX[i] + '-';
				else URLs[3] += colorsHEX[i].slice(0, -2) + '-';
			}
		}

		if (URLs[0] != `https://coolors.co/`){
			for (var i = 0; i < URLs.length; i++) {
				if (URLs[i] != `https://coolors.co/`) embed.setDescription(embed.description + `**[Link ${i+1}](${URLs[i].slice(0, -1)})**  `)
			}
			if (colorsHEX.length > 36) {
				embed.setDescription(embed.description + ' **...**');
			}
		}

		await message.channel.send(embed);
	});
}

function rgbToHex(r,g,b) {
	return (r | 1 << 8).toString(16).slice(1) + (g | 1 << 8).toString(16).slice(1) + (b | 1 << 8).toString(16).slice(1);
}

exports.palette = palette;