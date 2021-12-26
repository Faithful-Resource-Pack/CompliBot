import { MessageEmbed } from 'discord.js';
import { Command } from '../../Interfaces';

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
	"<#852223879535657010> my beloved",
	"Here's your ping. Now let me go back to sleep."
]

export const command: Command = {
	name: 'ping',
	description: 'Gets latency',
	usage: 'ping',
	aliases: [],
	run: async (client, message, args) => {
		var embed = new MessageEmbed().setTitle('Pinging...').setColor(client.config.colors.blue)

		var embedmessage = await message.reply({ embeds: [embed] })

		embed
			.setTitle('Pong!')
			// Bot latency broken with command suggestions, solution needed without using message.createdTimestamp
			// May not be up to date as of the typescript rewrite
			.setDescription(`_${quotes[Math.floor(Math.random() * quotes.length)]}_\n\n**Bot Latency** \n${embedmessage.createdTimestamp - message.createdTimestamp}ms \n**API Latency** \n${Math.round(client.ws.ping)}ms`)

		await embedmessage.edit({ embeds: [embed] })
		//addDeleteReact(m, message, true)
	},
};
