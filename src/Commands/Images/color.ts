import { Command } from '~/Interfaces';
import { colorAttachment } from '~/Functions/canvas/color';
import MessageEmbed from '~/Client/embed';
import { ColorResolvable, MessageAttachment } from 'discord.js';
import axios from 'axios';

export const command: Command = {
	name: 'color',
	description: 'Shows a hex color',
	usage: ['color (image attachment|reply to message with image attachment)', 'color (image url)'],
	aliases: ['hex', 'colour'], //im brittish im entitled to this
	run: async (client, message, args) => {
		let messageColor = '';

		if (!(args.length > 0)) return message.warn('No arguments were provided.');
		if (!args[0].match(/^(#|0x)?(?:[0-9a-fA-F]{3}){1,2}$/g)) return message.warn('Invalid color was provided!');

		//removes # if any for url stuff below
		messageColor = args[0].startsWith('#') ? args[0].substring(1).toUpperCase() : args[0].startsWith('0x') ? args[0].substring(2).toUpperCase() : args[0].toUpperCase();
		if (messageColor.length != 6) {
			messageColor = messageColor
				.split('')
				.map(function (hex) {
					return hex + hex;
				})
				.join('');
		}
		console.log('#' + messageColor);

		let colorAttach: MessageAttachment;
		try {
			colorAttach = await colorAttachment(messageColor, client);
		} catch (e) {
			return console.log(e);
		}

		let embed = new MessageEmbed()
			.setColor(('#' + messageColor) as ColorResolvable)
			.setThumbnail('attachment://color.png')
			.setTitle('#' + messageColor) //
			.setURL('https://coolors.co/' + messageColor.toLowerCase());

		var colorName = await axios.get(`https://www.thecolorapi.com/id?format=json&hex=${messageColor}`).then((response) => {
			return response.data.name.value;
		});

		var r = parseInt(messageColor.substring(0, 2), 16);
		var g = parseInt(messageColor.substring(2, 4), 16);
		var b = parseInt(messageColor.substring(4, 6), 16);
		embed.setDescription(
			`rgb \`(${r}, ${g}, ${b})\`\n
        hsl \`(${rgbToHsl(r, g, b)[0]}\°, ${rgbToHsl(r, g, b)[1] * 100 + '%, ' + rgbToHsl(r, g, b)[2] * 100}%)\`\n
        name \`${colorName}\`
        `,
		);

		message.channel.send({ embeds: [embed], files: [colorAttach] });
	},
};
function rgbToHsl(r: number, g: number, b: number) {
	(r /= 255), (g /= 255), (b /= 255);
	var max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	var h,
		s,
		l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}

	return [h.toFixed(2), s.toFixed(2), l.toFixed(2)];
}
