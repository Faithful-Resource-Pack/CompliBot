const prefix    = process.env.PREFIX;

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT

const Discord   = require("discord.js");
const strings   = require('../../resources/strings');
const settings  = require('../../resources/settings');
const colors    = require('../../resources/colors');

const { warnUser } = require('../../helpers/warnUser');
const { addDeleteReact } = require("../../helpers/addDeleteReact");

const BLACKLIST = [
  'shutdown', 'say', 'behave', 'hotfix'
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
			let command = client.commands.get(args[0]) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]))
			
			if (!command) return warnUser(message, 'This command/alias does not exist.')
				
			var aliases = ''
			var syntax = '```' + command.syntax + '```'
			if (command.flags) syntax += '```' + command.flags + '```'

			if (command.aliases) {
					for (var alias in command.aliases) {
					aliases += '``' + prefix + command.aliases[alias] + '`` '
				}
			} else aliases = 'None'

			var example = '```' + (command.example || 'None') + '```'

			embed.setTitle(`Help: ${prefix}${command.name}`)
				.setThumbnail(settings.BOT_IMG)
				.setColor(colors.BLUE)
				.setDescription(`**Description:**\n${command.description || 'No description'}\n**Can be used by:**\n${command.uses || 'Not set'}\n**Syntax:**\n${syntax}\n**Aliases:**\n${aliases}\n**Example:**\n${example}`)
				.setFooter(message.client.user.username, settings.BOT_IMG)
		}

		if (!args[0]) {
			
			let commands_anyone   = new Array()
			let commands_devs     = new Array()
			let commands_mods     = new Array()
			let commands_admins   = new Array()
			let commands_disabled = new Array()
			let commands_others   = new Array()

			client.commands.forEach(command => {
				if (!BLACKLIST.includes(command.name) && command.name !== undefined) {

					let stringBuilder

					stringBuilder = `— \`${prefix + command.name}\``
					if (command.aliases) {
						command.aliases.forEach(alias => {
							stringBuilder += `, \`${prefix + alias}\``
						})
					}

					switch (command.uses) {
						case strings.COMMAND_USES_ANYONE:
							commands_anyone.push(stringBuilder)
							break
						case strings.COMMAND_USES_DEVS:
							commands_devs.push(stringBuilder)
							break
						case strings.COMMAND_USES_ADMINS:
							commands_admins.push(stringBuilder)
							break
						case strings.COMMAND_USES_MODS:
							commands_mods.push(stringBuilder)
							break
						case strings.COMMAND_DISABLED:
							commands_disabled.push(stringBuilder)
							break
						default:
							commands_others.push(`${stringBuilder} — ${command.uses}`)
							break
					}

				}
			})

			commands_anyone.sort()
			commands_devs.sort()
			commands_admins.sort()
			commands_mods.sort()
			commands_disabled.sort()
			commands_others.sort()

			embed
			.setTitle('Commands available')
			.setThumbnail(settings.BOT_IMG)
			.setColor(colors.BLUE)
			.setDescription(`Type \`${prefix}help <command>\` to get more information about the specified command!`)
			.setFooter(message.client.user.username, settings.BOT_IMG)
			.addFields(
				{ name: "\u200B", value: commands_anyone[0] === undefined ? "None" : commands_anyone.join('\n') },
				{ name: "Others", value: commands_others[0] === undefined ? "None" : commands_others.join('\n') },
				{ name: "Disabled", value: commands_disabled[0] === undefined ? "None" : commands_disabled.join('\n') }
			)
			// roles don't exist in DM
			if (message.guild !== null && message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.name.includes("God"))) embed.addField("Moderators", commands_mods[0] === undefined ? "None" : commands_mods.join('\n') )
			if (message.guild !== null && message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("God"))) embed.addField("Administrators", commands_admins[0] === undefined ? "None" : commands_admins.join('\n') )
			if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) embed.addField("Developers", commands_devs[0] === undefined ? "None" : commands_devs.join('\n') )
		}

		const embedMessage = await message.reply({embeds: [embed]});
		addDeleteReact(embedMessage, message, true)
	}
}