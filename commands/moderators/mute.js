const prefix = process.env.PREFIX;

const { jsonModeration } = require('../../helpers/fileHandler');
const Discord  = require('discord.js');
const strings  = require('../../res/strings');
const colors   = require('../../res/colors');
const settings = require('../../settings.js');
const fs       = require('fs');

const { warnUser }     = require('../../functions/warnUser.js');
const { modLog }       = require('../../functions/moderation/modLog.js');
const { addMutedRole } = require('../../functions/moderation/addMutedRole.js');

module.exports = {
	name: 'mute',
	description: 'Mute someone',
	guildOnly: true,
	uses: 'Moderators',
	syntax: `${prefix}mute <@user> <time> <reason>`,
	async execute(client, message, args) {

		if (message.member.hasPermission('BAN_MEMBERS')) {
			if (args != '') {
				var role = message.guild.roles.cache.find(r => r.name === 'Muted');
				const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
				const reason = args.slice(2).join(' ') || 'Not Specified';
				var time   = args[1] || -100;

				if (time.includes('min'))                         time = 60 * parseInt(time, 10);
				if (time.includes('h') || time.includes('hour'))  time = 3600 * parseInt(time, 10);
				if (time.includes('d') || time.includes('day'))   time = 86400 * parseInt(time, 10);
				if (time.includes('w') || time.includes('week'))  time = 604800 * parseInt(time, 10);
				if (time.includes('m') || time.includes('month')) time = 2592000 * parseInt(time, 10);
				if (time.includes('y') || time.includes('year'))  time = 31536000 * parseInt(time, 10);

				if (member.id == message.author.id) return await warnUser(message, 'You can\'t mute yourself!');
				if (isNaN(time)) return await warnUser(message, 'You have to specify an integer!');		
				else {
					var timeout = undefined;
					if (time == -100) timeout = 'Unlimited';
					else timeout = `${time}`;

					addMutedRole(client, member.id);
					
					let warnList = await jsonModeration.read();
					
					// invisible try
					try {

					var index    = -1;

					for (var i = 0; i < warnList.length; i++) {
						if (warnList[i].user == `${member.id}`) {
							index = i;
							break;
						}
					}

					if (index != -1) {
						warnList[index].timeout = time;
						warnList[index].muted   = true;
					} else {
						warnList.push({
							"user": `${member.id}`,
							"timeout": parseInt(time),
							"muted": true
						})
					}
					
					await jsonModeration.write(warnList);

					// invisible catch
					} catch(_error) {
						jsonModeration.release();
					}

					var embed = new Discord.MessageEmbed()
						.setAuthor(message.author.tag, message.author.displayAvatarURL())
						.setDescription(`Muted ${member}\nReason: ${reason}\nTime: ${timeout}`)
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

					modLog(client, message, member, reason, time, 'muted');
				}
			} else return warnUser(message,strings.COMMAND_PROVIDE_VALID_TAG);
		} else return warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
};
