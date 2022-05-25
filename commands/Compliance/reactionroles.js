const prefix = process.env.PREFIX;

const Discord = require("discord.js")
const settings = require('../../resources/settings.json')

const strings = require('../../resources/strings.json')

const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'reactionroles',
	description: 'none',
	guildOnly: true,
	uses: strings.command.use.admins,
	category: 'Compliance',
	syntax: `${prefix}reactionroles`,
	flags: '',
	example: `${prefix}reactionroles`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Manager") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)

		var embed = new Discord.MessageEmbed()
			.setTitle('React with the appropriate emote to receive access to a project channel category.')
			.setColor(settings.colors.c32)
			.setThumbnail(settings.images.cextras)
			.setDescription('If you already have a role, you can react again to remove it. \n\n<:f_addons:962443509963579482> Add-ons \n\n<:f_tweaks:962443511330930759> Tweaks \n\n <:f_mods:962443510986969088>  Mods \n\n <:f_dungeons:962443509896458321> Dungeons')
		var embedMessage = await message.channel.send({ embeds: [embed] })
		await embedMessage.react(settings.emojis.caddons) //Add-ons
		await embedMessage.react(settings.emojis.ctweaks) //Tweaks
		await embedMessage.react(settings.emojis.cmods) //Mods
		await embedMessage.react(settings.emojis.cdungeons) //Dungeons
	}
}