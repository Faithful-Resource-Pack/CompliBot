const prefix = process.env.PREFIX;

const Discord   = require("discord.js");
const client    = new Discord.Client();
client.commands = new Discord.Collection();
const strings   = require('../res/strings');
const settings  = require('../settings.js');
const colors    = require('../res/colors');

const { warnUser } = require('../functions/warnUser.js');

const BLACKLIST = [
  'discords', 'reload', 'rules', 'shutdown', 'status', 'say', 'behave', 'embed', 'hotfix'
]

module.exports = {
	name: 'help',
	aliases: ['h', 'commands'],
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}help <command>`,
	description: strings.HELP_DESC_HELP,
	guildOnly: false,
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
					.setColor(colors.BLUE)
					.setDescription(`**Description:**\n${command.description || 'No description'}\n**Can be used by:**\n${command.uses || 'Not set'}\n**Syntax:**\n${syntax}\n**Aliases:**\n${aliases}`)
					.setFooter('CompliBot', settings.BOT_IMG);

			} else return warnUser(message, 'Please provide valid commands & do not use aliases');
		}

		if (!args[0]) {
			var string = 'Type ``' + prefix + 'help <command>`` to get more information about a specific command!\n\n';
			var commandsArray = []

			var stringBuilder = ""
			client.commands.forEach((value, key, map) => {
				if (!BLACKLIST.includes(value.name)) {
					stringBuilder = ""
					stringBuilder += `**${prefix + value.name}**`
					if (value.aliases) {
						stringBuilder += ' ( '
						value.aliases.forEach(element => {
							stringBuilder += prefix + element + ' '
						})
						stringBuilder += ')\n'
					}
					else stringBuilder += '\n'
					commandsArray.push(stringBuilder)
				}
			})

			commandsArray.sort()
			commandsArray.forEach(element => {
				string += element
			})

			var embed = new Discord.MessageEmbed()
				.setTitle('Commands available')
				.setThumbnail(settings.BOT_IMG)
				.setColor(colors.BLUE)
				.setDescription(string)
				.setFooter('CompliBot', settings.BOT_IMG)
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
					if (!message.deleted) await message.delete();
				}
			})
			.catch(async collected => {
				await embedMessage.reactions.cache.get('🗑️').remove();
			});
	}
}