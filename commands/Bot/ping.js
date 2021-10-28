const prefix = process.env.PREFIX
const Discord = require('discord.js')

const settings = require('../../resources/settings')
const colors = require('../../resources/colors')
const { string } = require('../../resources/strings')
const { addDeleteReact } = require('../../helpers/addDeleteReact')

const quotes = [
	"Feeling cute, might delete later",
	"Sentient",
	"https://youtu.be/dQw4w9WgXcQ",
	`Will become real in ${new Date().getFullYear() + 2}`, // takes the current year and adds 2 for extra confusion
	"I know what you did on January 23rd 2018 at 2:33 am",
	"<@865560086952280084> my beloved",
	"I am 100 meters from your location and rapidly approaching. Start running...",
	"<@468582311370162176> has your IP address",
	"Open your mind. ~Mr. Valve",
	"Open your eyes. ~Mr. Valve",
	"Yeah it's sour cream mmm I love drinking sour cream out of a bowl",
	"\*elevator music*",
	"Long-range nuclear missiles engaged and inbound to your location. Brace for impact in approximately `5` minutes.",
	"Have I been that much of a burden?",
	"STAHP",
	"Rise and shine… bot, rise and shine",
	"Networking the circuit…\nBypassing the back-end XML transistor…\nEncoding the DHCP pixel…",
	"\*Windows XP start-up jingle*",
	"Do not look behind you",
	"9+10=",
	"Does anybody even read these?",
	"Rule of thumb: Blame Discord API.",
	"<#852223879535657010> my beloved"
]

module.exports = {
	name: 'ping',
	description: string('command.description.ping'),
	guildOnly: false,
	uses: string('command.use.anyone'),
	category: 'Bot',
	syntax: `${prefix}ping`,
	async execute(client, message, args) {
		const m = new Discord.MessageEmbed().setTitle('Ping?').setColor(colors.BLUE)

		message.reply({ embeds: [m] }).then(async m => {
			const embed = new Discord.MessageEmbed()
				.setTitle('Pong!')
				.setColor(colors.BLUE)
				.setDescription(`_${quotes[Math.floor(Math.random() * quotes.length)]}_\n\n**Bot Latency** \n${m.createdTimestamp - message.createdTimestamp}ms \n**API Latency** \n${Math.round(client.ws.ping)}ms`)

			await m.edit({ embeds: [embed] })
			addDeleteReact(m, message, true)
		})
	}
}
