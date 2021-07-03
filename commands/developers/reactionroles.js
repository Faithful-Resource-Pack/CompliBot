const prefix   = process.env.PREFIX;

const Discord  = require("discord.js");
const settings = require('../../ressources/settings');
const strings  = require('../../ressources/strings');
const colors   = require('../../ressources/colors');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'reactionroles',
	description: 'none',
	guildOnly: true,
	uses: strings.COMMAND_USES_ADMINS,
	syntax: `${prefix}reactionroles`,
	flags: '',
	example: `${prefix}reactionroles`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("God"))) return warnUser(message, strings.COMMAND_NO_PERMISSION)

		var embed = new Discord.MessageEmbed()
			.setTitle('React with the appropriate emote to receive access to a project channel category.')
			.setColor(colors.C32)
			.setThumbnail(settings.CEXTRAS_IMG)
			.setDescription('If you already have a role, you can react again to remove it. \n\n<:ComplianceAddons:782350092106465300> Add-ons \n\n<:ComplianceTweaks:782350111694651452> Tweaks \n\n <:ComplianceMods:782350147119218718>  Mods \n\n <:ComplianceDungeons:782350138550648833> Dungeons')
		var embedMessage = await message.channel.send(embed)
		await embedMessage.react('782350092106465300') //Add-ons
		await embedMessage.react('782350111694651452') //Tweaks
		await embedMessage.react('782350147119218718') //Mods
		await embedMessage.react('782350138550648833') //Dungeons
	}
}