const prefix = process.env.PREFIX

/*
const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT
*/

const Discord = require("discord.js")
const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')
const fs = require('fs')

const { warnUser } = require('../../helpers/warnUser');
const { addDeleteReact } = require("../../helpers/addDeleteReact");

const BLACKLIST = [
	'shutdown', 'say', 'behave', 'hotfix', 'infoembed', 'reactionroles'
]

module.exports = {
	name: 'help',
	aliases: ['h', 'commands'],
	description: strings.command.description.help,
	category: 'Bot',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}help [category]\n${prefix}help [command]`,
	example: `${prefix}help bot\n${prefix}help bean`,
	async execute(client, message, args) {

		let embed = new Discord.MessageEmbed()
		let commandFolders = fs.readdirSync('./commands');

		if (args[0]) {
			let commandCategories = new Array()

			for (const folder of commandFolders) {
				commandCategories.push(folder.toLowerCase())
			}

			let commandList = new Array()

			client.commands.forEach(command => {
				commandList.push(command.name)
			})

			if(commandCategories.indexOf(args[0]) !== -1) {
				let commands = new Array()

				client.commands.forEach(command => {
					if (!BLACKLIST.includes(command.name) && command.name !== undefined) {
	
						let stringBuilder
	
						stringBuilder = `— \`${prefix + command.name}\``
						if (command.aliases) {
							command.aliases.forEach(alias => {
								stringBuilder += `, \`${prefix + alias}\``
							})
						}

						if(command.category != undefined && command.category.toLowerCase().includes(args[0])) commands.push(stringBuilder)
					}
				})

				embed
					.setTitle(`${args[0].charAt(0).toUpperCase() + args[0].slice(1)} commands`)
					.setThumbnail(client.user.displayAvatarURL())
					.setColor(settings.colors.blue)
					.setDescription(`Use \`${prefix}help [command]\` to view more about a command\n\n${commands.join('\n')}`)
			}
			else if(commandList.indexOf(args[0]) !== -1){
				let command = client.commands.get(args[0]) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]))

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
					.setThumbnail(client.user.displayAvatarURL())
					.setColor(settings.colors.blue)
					.setDescription(`**Description:**\n${command.description || 'No description'}\n**Can be used by:**\n${command.uses || 'Not set'}\n**Syntax:**\n${syntax}\n**Aliases:**\n${aliases}\n**Example:**\n${example}`)
					.setFooter(client.user.username, client.user.displayAvatarURL())
			}
			else return warnUser(message, 'The specified command or category does not exist.')
		}

		if (!args[0]) {
			let commandCategories = new Array()

			for (const folder of commandFolders) {
				commandCategories.push(`\`${folder}\``)
			}

			embed
				.setTitle('Categories available')
				.setThumbnail(client.user.displayAvatarURL())
				.setColor(settings.colors.blue)
				.setDescription(`${commandCategories.join('\n')}\n\nUse \`${prefix}help [category]\` to view the commands in a category`)

			// roles don't exist in DM
			//if (message.guild !== null && message.member.roles.cache.some(role => role.name.includes("Manager") || role.name.includes("Moderator") || role.id === '747839021421428776')) embed.addField("Moderation", commands_moderation[0] === undefined ? "None" : commands_moderation.join('\n'))
			//if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) embed.addField("Developer exclusive", commands_developer_exclusive[0] === undefined ? "None" : commands_developer_exclusive.join('\n'))
		}

		const embedMessage = await message.reply({ embeds: [embed] });
		addDeleteReact(embedMessage, message, true)
	}
}