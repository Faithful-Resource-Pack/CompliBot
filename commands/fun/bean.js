const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const strings  = require('../../res/strings');

const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'bean',
	description: 'get B E A N E D',
	uses: 'Moderators',
	syntax: `${prefix}bean <@user>`,

	async execute(client, message, args) {

		if (message.member.hasPermission('BAN_MEMBERS')) {
			if (args != '') {
				if (args == '<@!'+message.author.id+'>') {
					return await message.reply('You can\'t bean yourself!');
				}
				else {
					const embed = new Discord.MessageEmbed()
						.setAuthor(message.author.tag, message.author.displayAvatarURL())
				    .setDescription(`${args} was beaned!`)
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
                await message.delete();
				      }
			      })
            .catch(async () => {
		          await embedMessage.reactions.cache.get('🗑️').remove();
	          });
				}
			}	else return warnUser(message,strings.COMMAND_PROVIDE_VALID_TAG);
		} else return warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
};
