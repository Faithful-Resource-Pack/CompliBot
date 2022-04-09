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
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)

		var embed = new Discord.MessageEmbed()
			.setTitle('React with the appropriate emote to receive access to a project channel category.')
			.setColor(settings.colors.c32)
			.setThumbnail(settings.images.cextras)
			.setDescription('If you already have a role, you can react again to remove it. \n\n<:FaithfulAddons:782350092106465300> Add-ons \n\n<:FaithfulTweaks:782350111694651452> Tweaks \n\n <:FaithfulMods:782350147119218718>  Mods \n\n <:FaithfulDungeons:782350138550648833> Dungeons')
		var embedMessage = await message.channel.send({ embeds: [embed] })
		await embedMessage.react(settings.emojis.caddons) //Add-ons
		await embedMessage.react(settings.emojis.ctweaks) //Tweaks
		await embedMessage.react(settings.emojis.cmods) //Mods
		await embedMessage.react(settings.emojis.cdungeons) //Dungeons
	}
}