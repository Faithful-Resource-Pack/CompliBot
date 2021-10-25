const prefix = process.env.PREFIX;

const Discord = require("discord.js")
const settings = require('../../resources/settings')
const colors = require('../../resources/colors')

const { string } = require('../../resources/strings')
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'reactionroles',
	description: 'none',
	guildOnly: true,
	uses: string('command.use.admins'),
	category: 'Compliance exclusive',
	syntax: `${prefix}reactionroles`,
	flags: '',
	example: `${prefix}reactionroles`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) return warnUser(message, string('command.no_permission'))

		var embed = new Discord.MessageEmbed()
			.setTitle('React with the appropriate emote to receive access to a project channel category.')
			.setColor(colors.C32)
			.setThumbnail(settings.CEXTRAS_IMG)
			.setDescription('If you already have a role, you can react again to remove it. \n\n<:ComplianceAddons:782350092106465300> Add-ons \n\n<:ComplianceTweaks:782350111694651452> Tweaks \n\n <:ComplianceMods:782350147119218718>  Mods \n\n <:ComplianceDungeons:782350138550648833> Dungeons')
		var embedMessage = await message.channel.send({ embeds: [embed] })
		await embedMessage.react('782350092106465300') //Add-ons
		await embedMessage.react('782350111694651452') //Tweaks
		await embedMessage.react('782350147119218718') //Mods
		await embedMessage.react('782350138550648833') //Dungeons
	}
}