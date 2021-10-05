const prefix  = process.env.PREFIX
const Discord = require('discord.js')

const settings = require('../../resources/settings')
const colors   = require('../../resources/colors')
const strings  = require('../../resources/strings')
const { addDeleteReact } = require('../../helpers/addDeleteReact')

const quotes = [
	"Feeling cute, might delete later",
	"Sentient",
	"https://youtu.be/dQw4w9WgXcQ",
	`Will become real in ${new Date().getFullYear() + 2}`,
	"I know what you did on January 23rd 2018 at 2:33 am",
	"<@865560086952280084> my beloved",
	"I am 100 meters from your location and rapidly approaching. Start running...",
	"<@468582311370162176> has your IP address",
	"Open your mind. ~Mr. Valve",
	"Open your eyes. ~Mr. Valve",
	"Yeah it's sour cream mmm I love drinking sour cream out of a bowl"
]

module.exports = {
	name: 'ping',
	description: strings.HELP_DESC_PING,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}ping`,
	async execute(client, message, args) {
		const m = new Discord.MessageEmbed().setTitle('Ping?').setColor(colors.BLUE)

		message.reply({embeds: [m]}).then(async m => {
			const embed = new Discord.MessageEmbed()
				.setTitle('Pong!')
				.setColor(colors.BLUE)
				.setDescription(`_${quotes[Math.floor(Math.random() * quotes.length)]}_\n\nLatency: ${m.createdTimestamp - message.createdTimestamp}ms \nAPI Latency: ${Math.round(client.ws.ping)}ms`)
				.setFooter(message.client.user.username, settings.BOT_IMG)
				
			await m.edit({embeds: [embed]})
			addDeleteReact(m, message, true)
		})
	}
}
