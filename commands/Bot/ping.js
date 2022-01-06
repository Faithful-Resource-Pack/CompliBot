const prefix = process.env.PREFIX

const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')

const { MessageEmbed } = require('discord.js')
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
	"*elevator music*",
	"Long-range nuclear missiles engaged and inbound to your location. Brace for impact in approximately `5` minutes.",
	"Have I been that much of a burden?",
	"STAHP",
	"Rise and shine… bot, rise and shine",
	"Networking the circuit…\nBypassing the back-end XML transistor…\nEncoding the DHCP pixel…",
	"*Windows XP start-up jingle*",
	"Do not look behind you",
	"9+10=",
	"Does anybody even read these?",
	"Rule of thumb: Blame Discord API.",
	"<#852223879535657010> my beloved",
	"Here's your ping. Now let me go back to sleep.",
	"Fun fact: this is your ping",
]

module.exports = {
	name: 'ping',
	description: strings.command.description.ping,
	category: 'Bot',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}ping`,
	async execute(client, message) {
		// NEVER USE AWAIT ASYNC
		// only send response to maximize response time
		return message.channel.send('R').then((msg) => {
			const apiPing = client.ws.ping
			const botPing = msg.createdTimestamp - message.createdTimestamp
			
			const embed = new MessageEmbed()
				.setTitle('Pong!')
				.setColor(settings.colors.blue)
				// Bot latency broken with command suggestions, solution needed without using message.createdTimestamp
				.setDescription(`_${quotes[Math.floor(Math.random() * quotes.length)]}_

				**Bot Latency** \n${botPing}ms
				**API Latency** \n${Math.round(apiPing)}ms`)
			
			return Promise.all([msg.delete(), message.reply({ embeds: [embed] })])
		}).then(results => {
			const m = results[1]
			addDeleteReact(m, message, true)
		})
	}
}
