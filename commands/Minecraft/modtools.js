const prefix = process.env.PREFIX

const Discord = require("discord.js")
const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'modtools',
	description: strings.command.description.modtools,
	category: 'Minecraft',
	guildOnly: true,
	uses: strings.command.use.anyone,
	syntax: `${prefix}modtools`,
	async execute(client, message, args) {
		if (message.guild.id !== settings.guilds.cextras.id) return warnUser(message, strings.command.modtools.extras);

		const embed = new Discord.MessageEmbed()
			.setTitle('Tools for making Dungeons mods:')
			.setColor(settings.colors.cdungeons)
			.setThumbnail(settings.images.cdungeons)
			.addFields(
				{ name: 'Dungeons mod kit by CCCode:', value: 'https://github.com/Dokucraft/Dungeons-Mod-Kit', inline: true },
				{ name: 'Loading icon creator:', value: 'https://github.com/Faithful-Resource-Pack/Faithful-Dungeons-32x/tree/master/Tools/loader', inline: true },
				{ name: 'Alpha image converter:', value: 'https://github.com/Faithful-Resource-Pack/Faithful-Dungeons-32x/tree/master/Tools/alpha_img', inline: true },
			)
			.setFooter('Faithful Dungeons', settings.images.cdungeons)

		await message.reply({ embeds: [embed] })
	}
};
