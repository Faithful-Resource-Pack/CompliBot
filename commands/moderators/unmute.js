const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const strings  = require('../../res/strings');
const colors   = require('../../res/colors');
const settings = require('../../settings.js');
const fs       = require('fs');

const { warnUser }        = require('../../functions/warnUser.js');
const { modLog }          = require('../../functions/moderation/modLog.js');
const { removeMutedRole } = require('../../functions/moderation/removeMutedRole.js');
const { jsonModeration }  = require('../../helpers/fileHandler');

module.exports = {
	name: 'unmute',
	aliases: ['pardon'],
	description: strings.HELP_DESC_UNMUTE,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}unmute <@user> <reason>`,
	example: `${prefix}unmute @Domi#5813 not posting memes in #general`,
	async execute(client, message, args) {

		if (!message.member.hasPermission('BAN_MEMBERS')) return await warnUser(message, strings.COMMAND_NO_PERMISSION);
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

		const embedMessage = await message.inlineReply(embed);
		await embedMessage.react('🗑️');
		const filter = (reaction, user) => {
			return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
		};

		embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first();
				if (reaction.emoji.name === '🗑️') {
					await embedMessage.delete();
					if (!message.deleted) await message.delete();
				}
			})
			.catch(async () => {
				await embedMessage.reactions.cache.get('🗑️').remove();
			});

		modLog(client, message, userID, reason, 0, 'unmuted')
	}
	
}
