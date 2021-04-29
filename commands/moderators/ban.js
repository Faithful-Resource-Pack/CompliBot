const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const strings = require('../../res/strings');
const colors  = require('../../res/colors');

const { warnUser } = require('../../functions/warnUser.js');
const { modLog }   = require('../../functions/moderation/modLog.js');

module.exports = {
	name: 'ban',
	description: strings.HELP_DESC_BAN,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}ban <@user> <reason>`,
	example: `${prefix}ban @RobertR11#7841 breaking rule 69`,
	async execute(client, message, args) {
		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'Not Specified';
		const bob    = message.guild.members.cache.get(client.user.id);

		if (!bob.hasPermission('BAN_MEMBERS')) return await warnUser(message, strings.BAN_BOT_NO_PERMISSION);

		if (!message.member.hasPermission('BAN_MEMBERS')) return await warnUser(message, strings.COMMAND_NO_PERMISSION);

		if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);

		if (!member) return await warnUser(message, strings.BAN_SPECIFY_USER);

		if (member.id === message.author.id) return await warnUser(message, strings.BAN_CANT_BAN_SELF);

		if (member.id === client.user.id) return await message.channel.send(strings.COMMAND_NOIDONTTHINKIWILL_LMAO);

		if (!member.bannable) return await warnUser(message, strings.BAN_NOT_BANNABLE);

		message.guild.members.cache.get(member.id).ban({reason: reason});

		modLog(client, message, member, reason, 'none', 'banned');
				
		var embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription(`Banned ${member} \nReason: ${reason}`)
			.setColor(colors.BLUE)
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
	}
};
