/* eslint-env node */

/**
 * COMPLIBOT INDEX FILE:
 * - Developped by and for the Compliance Community.
 * - Please read our License first.
 * - If you find any bugs, please use our bug tracker
 */

// Libraries
const fs = require('fs')
const Discord = require('discord.js')
const { walkSync } = require('./helpers/walkSync')
require('dotenv').config()

// eslint-disable-next-line no-unused-vars
const { Client, Intents } = require('discord.js')
const client = new Client({
	allowedMentions: { parse: [ 'users', 'roles' ], repliedUser: false },
	restTimeOffset: 0,
	partials: Object.values(Discord.Constants.PartialTypes),
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_INTEGRATIONS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MESSAGES, 
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS, 
		Intents.FLAGS.GUILD_MESSAGE_TYPING, 
		Intents.FLAGS.DIRECT_MESSAGES, 
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, 
		Intents.FLAGS.DIRECT_MESSAGE_TYPING
	]
})

module.exports.Client = client

// Environment vars
const DEV = (process.env.DEV.toLowerCase() == 'true')
const LOG_DEV = ((process.env.LOG_DEV.toLowerCase() || 'false') == 'true')

// Resources: 
const colors = require('./resources/colors')

/**
 * (Deprecated) COMMAND HANDLER
 */
const commandFiles = walkSync('./commands').filter(f => f.endsWith('.js'))
client.commands = new Discord.Collection()
for (const file of commandFiles) {
	const command = require(file)
	if ('name' in command && typeof(command.name) === 'string')
		client.commands.set(command.name, command)
}

/**
 * EVENT HANDLER
 * - See the /events folder
 */
const eventsFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'))
for (const file of eventsFiles) {
	const event = require(`./events/${file}`)
	if (event.once) client.once(event.name, (...args) => event.execute(...args))
	else client.on(event.name, (...args) => event.execute(...args))
}

// eslint-disable-next-line no-unused-vars
process.on('unhandledRejection', (reason, promise) => {
	if (DEV) return console.trace(reason.stack || reason)

	const channel = client.channels.cache.get(LOG_DEV ? '875301873316413440' : '853547435782701076')
	const embed = new Discord.MessageEmbed()
		.setTitle('Unhandled Rejection')
		.setDescription(`\`\`\`fix\n${reason.stack || JSON.stringify(reason)}\`\`\``)
		.setColor(colors.RED)
		.setTimestamp()
	
	channel.send({ embeds: [embed] })
})

client.login(process.env.CLIENT_TOKEN).catch(console.error)