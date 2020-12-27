const Discord = require('discord.js');
const speech  = require('../messages');

module.exports = {
	name: 'bean',
	description: 'get B E A N E D',
	uses: 'Moderators',
	syntax: `${prefix}bean <@user>`,

	async execute(client, message, args) {

		if(message.member.roles.cache.find(r => r.name === "God") || message.member.roles.cache.find(r => r.name === "Moderator") || message.member.roles.cache.find(r => r.name === "Moderators") ||message.member.roles.cache.find(r => r.name === "Mods")) {
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
            .catch(async collected => {
		          await embedMessage.reactions.cache.get('🗑️').remove();
	          });
				}
			}
			else {
				return await message.reply(speech.COMMAND_PROVIDE_VALID_TAG);
			}
		} else {
			const msg = await message.reply(speech.COMMAND_NO_PERMISSION);
      await message.react('❌');
      await msg.delete({timeout: 30000});
		}
	}
};