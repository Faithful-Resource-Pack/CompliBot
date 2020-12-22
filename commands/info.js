const Discord = require("discord.js");
const settings = require('../settings.js');

module.exports = {
	name: 'info',
	aliases: ['information'],
	description: 'Displays some info of the bot in your DMs',
	uses: 'Anyone',
	syntax: `${prefix}info`,
	async execute(client, message, args) {
		if (message.channel.type !== 'dm') {
      await message.reply('please check your dm\'s!');
      const embed = new Discord.MessageEmbed()
				.setTitle('CompliBot info:')
				.setThumbnail(settings.BotIMG)
        .setDescription('This is the official bot of all Compliance Resource Pack discords, developed by the Compliance Team!')
				.addFields(
					{ name: '\u200B', value: '**Features:**'},
					{ name: '🔍 Image resizing', value: 'With the `/magnify` command you can resize images by a certain factor! \nKeep in mind, this feature was made for textures, other images may look weird.'},
          { name: '🎨 Texture viewer', value: 'Currently only working in the Dungeons discord; With `/texture *texture name*` you can quickly get send a texture and its information!'},
          { name: '❗ Modping', value: 'With the `/modping` command you can let me ping all mods online on one of our servers to get help.'},
          { name: '🗺️ soon™️: Translations', value: 'Soon you can translate any message when typing `/translate *to language* *your text*` or by reacting with a flag emoji to an existing message!'},
        )
				.setFooter('\u200B \nI am completely open source! \nYou can find me here: https://github.com/Compliance-Resource-Pack/Discord-Bot');

			await message.author.send(embed);
    }
		else {
			const embed = new Discord.MessageEmbed()
				.setTitle('CompliBot info:')
				.setThumbnail(settings.BotIMG)
        .setDescription('This is the official bot of all Compliance Resource Pack discords, developed by the Compliance Team!')
				.addFields(
					{ name: '\u200B', value: '**Features:**'},
					{ name: '🔍 Image resizing', value: 'With the `/magnify` command you can resize images by a certain factor! \nKeep in mind, this feature was made for textures, other images may look weird.'},
          { name: '🎨 Texture viewer', value: 'Currently only working in the Dungeons discord; With `/texture *texture name*` you can quickly get send a texture and its information!'},
          { name: '❗ Modping', value: 'With the `/modping` command you can let me ping all mods online on one of our servers to get help.'},
          { name: '🗺️ soon™️: Translations', value: 'Soon you can translate any message when typing `/translate *to language* *your text*` or by reacting with a flag emoji to an existing message!'},
        )
				.setFooter('\u200B \nI am completely open source! \nYou can find me here: https://github.com/Compliance-Resource-Pack/Discord-Bot');

			await message.channel.send(embed);
		}
	}
};