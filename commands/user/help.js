const prefix    = process.env.PREFIX;
const Discord   = require("discord.js");
const client    = new Discord.Client();
client.commands = new Discord.Collection();
const strings   = require('../../ressources/strings');
const settings  = require('../../ressources/settings.js');
const colors    = require('../../ressources/colors');

const { warnUser } = require('../../helpers/warnUser.js');

const BLACKLIST = [
  'discords', 'reload', 'rules', 'shutdown', 'status', 'say', 'behave', 'embed', 'hotfix', 'database'
]

module.exports = {
	name: 'help',
	aliases: ['h', 'commands'],
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}help <command>\n${prefix}help <alias>`,
	description: strings.HELP_DESC_HELP,
	guildOnly: false,
	example: `${prefix}help modping`,
	async execute(client, message, args) {

		let embed = new Discord.MessageEmbed()

		if (args[0]) {
			let command = client.commands.get(args[0]) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));
			
			if (!command) return warnUser(message, 'This command/alias does not exist.');
				
			var aliases = '';
			var syntax = '```' + command.syntax + '```';
			if (command.flags) syntax += '```' + command.flags + '```';

			if (command.aliases) {
					for (var alias in command.aliases) {
					aliases += '``' + prefix + command.aliases[alias] + '`` ';
				}
			} else aliases = 'None'

			var example = '```' + (command.example || 'None') + '```';

			embed
				.setTitle(`Help: ${prefix}${command.name}`)
				.setThumbnail(settings.BOT_IMG)
				.setColor(colors.BLUE)
				.setDescription(`**Description:**\n${command.description || 'No description'}\n**Can be used by:**\n${command.uses || 'Not set'}\n**Syntax:**\n${syntax}\n**Aliases:**\n${aliases}\n**Example:**\n${example}`)
				.setFooter(message.client.user.username, settings.BOT_IMG);
		}

		if (!args[0]) {
			var string = 'Type ``' + prefix + 'help <command>`` to get more information about a specific command!\n\n';
			var commandsArray = []

			var stringBuilder = ""
			client.commands.forEach((value, _key, _map) => {
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

			embed
				.setTitle('Commands available')
				.setThumbnail(settings.BOT_IMG)
				.setColor(colors.BLUE)
				.setDescription(string)
				.setFooter(message.client.user.username, settings.BOT_IMG)
		}

		const embedMessage = await message.inlineReply(embed);
		if (message.channel.type !== 'dm') await embedMessage.react('🗑️');

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
				if (!embedMessage.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🗑️').remove();
			});
	}
}