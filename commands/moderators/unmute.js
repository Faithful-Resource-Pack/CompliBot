const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const strings = require('../../resources/strings');
const colors  = require('../../resources/colors');

const { warnUser }        = require('../../helpers/warnUser');
const { modLog }          = require('../../functions/moderation/modLog');
const { removeMutedRole } = require('../../functions/moderation/removeMutedRole');

module.exports = {
	name: 'unmute',
	aliases: ['pardon'],
	description: strings.HELP_DESC_UNMUTE,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}unmute <@user> <reason>`,
	example: `${prefix}unmute @Domi#5813 not posting memes in #general`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.name.includes("God"))) return warnUser(message, strings.COMMAND_NO_PERMISSION)
		if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);

		let userID = undefined
		try {
			let member = message.mentions.member.first() || message.guild.members.cache.get(args[0])
			userID = member.id
		}
		catch (err) {
			userID = args[0].replace('<!@', '').replace('<@', '').replace('>', '')
		}

		if (userID.startsWith('!')) userID = userID.replace('!', '')

		const reason = args.slice(1).join(' ') || 'Not Specified'

		if (!userID) return await warnUser(message, strings.UNMUTE_SPECIFY_USER);

		removeMutedRole(client, userID);

		var embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(`Unmuted <@!${userID}> \nReason: ${reason}`)
			.setColor(colors.BLACK)
			.setTimestamp();

		await message.reply({embeds: [embed]});

		modLog(client, message, userID, reason, 0, 'unmuted')
	}
	
}
