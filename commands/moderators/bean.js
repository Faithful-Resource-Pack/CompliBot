const prefix  = process.env.PREFIX;
const Discord = require('discord.js');

const strings = require('../../ressources/strings');
const colors  = require('../../ressources/colors');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'bean',
	description: strings.HELP_DESC_BEAN,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}bean <@user> <reason>`,
	example: `${prefix}bean @Sei#0721 spilling the beans`,
	async execute(client, message, args) {

		if (!message.member.hasPermission('BAN_MEMBERS')) return warnUser(message,strings.COMMAND_NO_PERMISSION);
		if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const reason = args.slice(1).join(' ') || 'Not Specified';

		if (!member) return warnUser(message, strings.BEAN_SPECIFY_USER);
		if (member.id === message.author.id) return warnUser(message, strings.BEAN_CANT_BEAN_SELF);
		if (member.id === client.user.id) return await message.channel.send(strings.COMMAND_NOIDONTTHINKIWILL_LMAO);

		else {
			const embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setDescription(`Beaned ${member} \nReason: ${reason}`)
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
	}
};
