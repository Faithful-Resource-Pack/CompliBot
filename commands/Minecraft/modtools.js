const prefix = process.env.PREFIX;

const Discord = require("discord.js");
const settings = require('../../resources/settings');
const { string } = require('../../resources/strings');
const colors = require('../../resources/colors');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'modtools',
	description: string('command.description.modtools'),
	guildOnly: true,
	uses: string('command.use.anyone'),
	category: 'Minecraft',
	syntax: `${prefix}modtools`,
	async execute(client, message, args) {
		if (message.guild.id !== settings.CEXTRAS_ID) return warnUser(message, 'This command can only be used in the Compliance Extras server!');

		const embed = new Discord.MessageEmbed()
			.setTitle('Tools for making Dungeons mods:')
			.setColor(colors.CDUNGEONS)
			.setThumbnail(settings.CDUNGEONS_IMG)
			.addFields(
				{ name: 'Dungeons mod kit by CCCode:', value: 'https://github.com/Dokucraft/Dungeons-Mod-Kit', inline: true },
				{ name: 'Loading icon creator:', value: 'https://github.com/Compliance-Dungeons/Resource-Pack/tree/master/Tools/loader', inline: true },
				{ name: 'Alpha image converter:', value: 'https://github.com/Compliance-Dungeons/Resource-Pack/tree/master/Tools/alpha_img', inline: true },
			)
			.setFooter('Compliance Dungeons', settings.CDUNGEONS_IMG);

		await message.reply({ embeds: [embed] });
	}
};
