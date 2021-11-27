const prefix = process.env.PREFIX

const Discord = require("discord.js")
const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')

module.exports = {
	name: 'info',
	aliases: ['botinfo'],
	description: strings.command.description.info,
	category: 'Bot',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}info`,
	async execute(client, message, args) {
		if (message.channel.type !== 'DM') await message.reply({ content: 'Please check your dm\'s!' });

		let seconds = Math.floor(message.client.uptime / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);
		let days = Math.floor(hours / 24);

		let tseconds = 'seconds';
		let tminutes = 'minutes';
		let thours = 'hours';
		let tdays = 'days';

		seconds %= 60;
		minutes %= 60;
		hours %= 24;

		if (seconds == 1) tseconds = 'second';
		if (minutes == 1) tminutes = 'minute';
		if (hours == 1) thours = 'hour';
		if (days == 1) thours = 'day';

		const embed = new Discord.MessageEmbed()
			.setTitle(`${client.user.username} Info:`)
			.setThumbnail(client.user.displayAvatarURL())
			.setColor(settings.colors.blue)
			.setDescription('This is the official bot of all Compliance Resource Pack discords, developed by the Compliance Team!')
			.addFields(
				{ name: '\u200B', value: '**Features:**' },
				{ name: '🔍 Image Resizing', value: 'With the `/magnify <factor>` command you can resize images by a certain factor! \nKeep in mind, this feature was made for textures, other images may look weird.' },
				{ name: '🔍 Image Tiling', value: 'With the `/tile` command you can tile mainly block textures to a 3x3 field!' },
				{ name: '🎨 Texture Viewer', value: 'With `/texture <resolution> <texture name>` you can quickly get send a texture and its information!' },
				{ name: '❗ Modping', value: 'With the `/modping` command you can let me ping all mods online on one of our servers to get help.' },
				{ name: '🗺️ soon™️: Translations', value: 'Soon you can translate any message when typing `/translate *to language* *your text*` or by reacting with a flag emoji to an existing message!' },
				{ name: 'And more!', value: 'If you need a full list of all my commands, then use `/help`!' },
				{ name: '\u200B', value: '\n\nI am completely open source!\nYou can find me by [clicking here](https://github.com/Compliance-Resource-Pack/Discord-Bot).' },
			)
			.setFooter(`Bot Uptime: ${days} ${tdays}, ${hours} ${thours}, ${minutes} ${tminutes}, ${seconds} ${tseconds}`)

		if (message.channel.type !== 'DM') await message.author.send({ embeds: [embed] });
		else await message.reply({ embeds: [embed] });
	}
};
