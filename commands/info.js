const prefix = process.env.PREFIX;

const Discord  = require("discord.js");
const settings = require('../settings.js');
const colors   = require('../res/colors');

module.exports = {
	name: 'info',
	aliases: ['information'],
	description: 'Displays some info about the bot in your DMs',
	uses: 'Anyone',
	syntax: `${prefix}info`,
	async execute(client, message, args) {
		if (message.channel.type !== 'dm') {
			await message.channel.send('Please check your dm\'s!');
		}

		const embed = new Discord.MessageEmbed()
			.setTitle('CompliBot Info:')
			.setThumbnail(settings.BOT_IMG)
			.setColor(colors.BLUE)
			.setDescription('This is the official bot of all Compliance Resource Pack discords, developed by the Compliance Team!')
			.addFields(
				{ name: '\u200B', value: '**Features:**'},
				{ name: '🔍 Image Resizing', value: 'With the `/magnify <factor>` command you can resize images by a certain factor! \nKeep in mind, this feature was made for textures, other images may look weird.'},
				{ name: '🔍 Image Tiling', value: 'With the `/tile` command you can tile mainly block textures to a 3x3 field!'},
				{ name: '🎨 Texture Viewer', value: 'With `/texture <resolution> <texture name>` you can quickly get send a texture and its information!'},
				{ name: '❗ Modping', value: 'With the `/modping` command you can let me ping all mods online on one of our servers to get help.'},
				{ name: '🗺️ soon™️: Translations', value: 'Soon you can translate any message when typing `/translate *to language* *your text*` or by reacting with a flag emoji to an existing message!'},
				{ name: 'And more!', value: 'If you need a full list of all my commands, then use `/help`!'},
			)
				.setFooter('\u200B \nI am completely open source!\nYou can find me here: https://github.com/Compliance-Resource-Pack/Discord-Bot');

		await message.author.send(embed);
	}
};
