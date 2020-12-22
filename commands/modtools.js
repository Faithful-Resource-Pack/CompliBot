const Discord  = require("discord.js");
const settings = require('../settings.js');

module.exports = {
	name: 'modtools',
	description: 'Displays tools for Minecraft Dungeons modding',
	uses: 'Anyone on Compliance Dungeons Discord',
	syntax: `${prefix}modtools`,
	async execute(client, message, args) {
		if (message.channel.type === 'dm' || message.guild.id !== settings.CDungeonsID) {
			const msg = await message.reply('this command can only be used in the Compliance Dungeons server!');
      await message.react('❌');
      await msg.delete({timeout: 30000});
    }
		else {
		//console.trace('modding tools triggered');

			const embed = new Discord.MessageEmbed()
				.setTitle('Tools for making Dungeons mods:')
				.setColor(settings.CDungeonsColor)
				.setThumbnail(settings.CDungeonsIMG)
				.addFields(
					{ name: 'Dungeons mod kit by CCCode:', value: 'https://github.com/Dokucraft/Dungeons-Mod-Kit', inline: true },
					{ name: 'Loading icon creator:', value: 'https://github.com/Faithful-Dungeons/Resource-Pack/tree/master/Tools/loader', inline: true },
					{ name: 'Alpha image converter:', value: 'https://github.com/Faithful-Dungeons/Resource-Pack/tree/master/Tools/alpha_img', inline: true },
				)
				.setFooter('Compliance Dungeons', settings.CDungeonsIMG);

			await message.channel.send(embed);
		}
	}
};