const Discord = require("discord.js");
const client    = new Discord.Client();
client.commands = new Discord.Collection();
const settings = require('../settings.js');

module.exports = {
	name: 'help',
	aliases: ['h', 'commands'],
	uses: 'Anyone',
	syntax: `${prefix}help <command>`,
	description: 'Show help for a specified command',
	async execute(client, message, args) {

		if (args[0]) {
			let command = args[0];

			if (client.commands.has(command)) {
				command = client.commands.get(command);

				var aliases = '';
				var syntax = '``' + command.syntax + '``';
				if (command.aliases) {
						for (var alias in command.aliases) {
						aliases += '``' + prefix + command.aliases[alias] + '`` '; 
					}
				} else aliases = 'None'

				var embed = new Discord.MessageEmbed()
				.setTitle(`Help: ${prefix}${command.name}`)
				.setThumbnail(settings.BOT_IMG)
				.setDescription(`**Description:**\n${command.description || 'No description'}\n**Can be used by:**\n${command.uses || 'Not set'}\n**Syntax:**\n${syntax}\n**Aliases:**\n${aliases}`)
				.setFooter('CompliBot', settings.BOT_IMG);
				
			}

			else {
				var embed = new Discord.MessageEmbed()
				.setTitle('No commands found for: ' + prefix + args[0] )
				.setThumbnail(settings.BOT_IMG)
				.setDescription('Please provide valid commands & do not use aliases')
				.setFooter('CompliBot', settings.BOT_IMG);
			}
		}

		if (!args[0]) {
			
			let commands = Array.from(client.commands.keys());
			var list = 'Type ``' + prefix + 'help <command>`` to get more information about a command!\n> Do not use aliases :warning:\n\n';
			for (var i in commands) {
				command = client.commands.get(commands[i])
				list += `**${prefix + command.name}**`
				if (command.aliases) {
					list += ' ( ';
					for (var j in command.aliases) {
						list += prefix + command.aliases[j] + ' '
					}
					list += ')\n';
				} else list += '\n'
			}

			var embed = new Discord.MessageEmbed()
				.setTitle('Commands available:')
				.setThumbnail(settings.BOT_IMG)
				.setDescription(list)
				.setFooter('CompliBot', settings.BOT_IMG);
		}

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