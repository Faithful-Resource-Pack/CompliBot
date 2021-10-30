const prefix = process.env.PREFIX;

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT

const Discord = require("discord.js");
const { string } = require('../../resources/strings');
const settings = require('../../resources/settings');
const colors = require('../../resources/colors');

const { warnUser } = require('../../helpers/warnUser');
const { addDeleteReact } = require("../../helpers/addDeleteReact");

const BLACKLIST = [
	'shutdown', 'say', 'behave', 'hotfix', 'infoembed', 'reactionroles'
]

module.exports = {
	name: 'help',
	aliases: ['h', 'commands'],
	description: string('command.description.help'),
	category: 'Bot',
	guildOnly: false,
	uses: string('command.use.anyone'),
	syntax: `${prefix}help <command>\n${prefix}help <alias>`,
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

			let commands_bot = new Array()
			let commands_compliance_exclusive = new Array()
			let commands_developer_exclusive = new Array()
			let commands_fun = new Array()
			let commands_images = new Array()
			let commands_minecraft = new Array()
			let commands_moderation = new Array()
			let commands_server = new Array()

			client.commands.forEach(command => {
				if (!BLACKLIST.includes(command.name) && command.name !== undefined) {

					let stringBuilder

					stringBuilder = `— \`${prefix + command.name}\``
					if (command.aliases) {
						command.aliases.forEach(alias => {
							stringBuilder += `, \`${prefix + alias}\``
						})
					}

					switch (command.category) {
						case 'Bot':
							commands_bot.push(stringBuilder)
							break
						case 'Compliance exclusive':
							commands_compliance_exclusive.push(stringBuilder)
							break
						case 'Developer exclusive':
							commands_developer_exclusive.push(stringBuilder)
							break
						case 'Fun':
							commands_fun.push(stringBuilder)
							break
						case 'Images':
							commands_images.push(stringBuilder)
							break
						case 'Minecraft':
							commands_minecraft.push(stringBuilder)
							break
						case 'Moderation':
							commands_moderation.push(stringBuilder)
							break
						case 'Server':
							commands_server.push(stringBuilder)
							break
					}

				}
			})

			commands_bot.sort()
			commands_compliance_exclusive.sort()
			commands_developer_exclusive.sort()
			commands_fun.sort()
			commands_images.sort()
			commands_minecraft.sort()
			commands_moderation.sort()
			commands_server.sort()

			embed
				.setTitle('Commands available')
				.setThumbnail(settings.BOT_IMG)
				.setColor(colors.BLUE)
				.setDescription(`Type \`${prefix}help <command>\` to get more information about the specified command.`)
				.setFooter(message.client.user.username, settings.BOT_IMG)
				.addFields(
					{ name: "Bot", value: commands_bot[0] === undefined ? "None" : commands_bot.join('\n') },
					{ name: "Compliance exclusive", value: commands_compliance_exclusive[0] === undefined ? "None" : commands_compliance_exclusive.join('\n') },
					{ name: "Fun", value: commands_fun[0] === undefined ? "None" : commands_fun.join('\n') },
					{ name: "Images", value: commands_images[0] === undefined ? "None" : commands_images.join('\n') },
					{ name: "Minecraft", value: commands_minecraft[0] === undefined ? "None" : commands_minecraft.join('\n') },
					{ name: "Server", value: commands_server[0] === undefined ? "None" : commands_server.join('\n') }
				)
			// roles don't exist in DM
			if (message.guild !== null && message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.id === '747839021421428776')) embed.addField("Moderation", commands_moderation[0] === undefined ? "None" : commands_moderation.join('\n'))
			if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) embed.addField("Developer exclusive", commands_developer_exclusive[0] === undefined ? "None" : commands_developer_exclusive.join('\n'))
		}

		const embedMessage = await message.reply({ embeds: [embed] });
		addDeleteReact(embedMessage, message, true)
	}
}