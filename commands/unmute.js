const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const strings  = require('../res/strings');
const colors   = require('../res/colors');
const settings = require('../settings.js');
const fs       = require('fs');

const { warnUser }        = require('../functions/warnUser.js');
const { modLog }          = require('../functions/moderation/modLog.js');
const { removeMutedRole } = require('../functions/moderation/removeMutedRole.js');
const { jsonModeration } = require('../helpers/fileHandler');

module.exports = {
	name: 'unmute',
	aliases: ['pardon'],
	description: 'Remove Muted roles to someone',
	guildOnly: true,
	uses: 'Moderators',
	syntax: `${prefix}unmute <@user> <reason>`,
	async execute(client, message, args) {

		if (message.member.hasPermission('BAN_MEMBERS')) {
			if (args != '') {
				var role = message.guild.roles.cache.find(role => role.name === 'Muted');
				const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
				const reason = args.slice(1).join(' ') || 'Not Specified';

				if (member == undefined) return;
				else {
					removeMutedRole(client, member.id);

					let warnList = jsonModeration.read();
					var index    = -1;

					for (var i = 0; i < warnList.length; i++) {
						if (warnList[i].user == `${member.id}`) {
							index = i;
							break;
						}
					}

					if (index != -1) {
						warnList[index].timeout = 0;
						warnList[index].muted   = false;
					} else {
						warnList.push({
							"user": `${member.id}`,
							"timeout": 0,
							"muted": false
						})
					}

					jsonModeration.write(warnList);

					var embed = new Discord.MessageEmbed()
						.setAuthor(message.author.tag, message.author.displayAvatarURL())
						.setDescription(`Unmuted ${member} \nReason: ${reason}`)
						.setColor(colors.BLUE)
						.setTimestamp();

					const embedMessage = await message.channel.send(embed);
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

					modLog(client, message, member, reason, 0, 'unmuted')
				}
			} else return warnUser(message,strings.COMMAND_PROVIDE_VALID_TAG);
		} else return warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
};
