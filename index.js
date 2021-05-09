/*eslint-env node*/

/**
 * COMPLIBOT MAIN FILE:
 * Developped by and for the Compliance Community.
 */

// Libs:
require('dotenv').config()
const Discord   = require('discord.js')
const http      = require('http')
const cron      = require('cron')
const client    = new Discord.Client({ disableMentions: 'everyone', restTimeOffset: 0 })
client.commands = new Discord.Collection()
const PORT      = 3000
require("./modified_libraries/ExtendedMessage")

// Admins & settings:
const UIDA = [
	process.env.UIDR,
	process.env.UIDD,
	process.env.UIDT,
	process.env.UIDJ
]
const prefix      = process.env.PREFIX
const DEBUG       = (process.env.DEBUG.toLowerCase() == 'true')
const MAINTENANCE = (process.env.MAINTENANCE.toLowerCase() == 'true')

// Helpers:
const { jsonModeration }    = require('./helpers/fileHandler')

// Functions:
const { autoReact }         = require('./functions/autoReact')
const { updateMembers }     = require('./functions/updateMembers.js')
const { walkSync }          = require('./functions/walkSync')
const { quote }             = require('./functions/quote')
const { warnUser }          = require('./functions/warnUser.js')
const { textureSubmission } = require('./functions/textures_submission/textureSubmission.js')
const { textureCouncil }    = require('./functions/textures_submission/textureCouncil.js')
const { textureRevote }     = require('./functions/textures_submission/textureRevote.js')
const { getResults }        = require('./functions/textures_submission/getResults.js')
const { doPush }            = require('./functions/doPush.js')
const { checkTimeout }      = require('./functions/moderation/checkTimeout.js')
const { addMutedRole }      = require('./functions/moderation/addMutedRole.js')
const { inviteDetection }   = require('./functions/moderation/inviteDetection.js')

// try to read this json
jsonModeration.read(false).then(warnList => { // YOU MUST NOT LOCK because only read

// Resources:
const colors  = require('./res/colors')
const strings = require('./res/strings')

// Import settings & commands handler:
const commandFiles = walkSync('./commands').filter(file => file.endsWith('.js'))
const settings     = require('./settings')

/**
 * SCHEDULED FUNCTIONS : Texture Submission
 * - Global process (each day at 00:00 GMT)         : @function submissionProcess
 * - Download process (each day at 00:10 GMT)       : @function downloadToBot
 * - Push to GitHub process (each day at 00:15 GMT) : @function pushToGithub
 */
const submissionProcess = new cron.CronJob('0 0 * * *', async () => {
	// Compliance 32x
	await textureSubmission(client, settings.C32_SUBMIT_1,  settings.C32_SUBMIT_2, 3)
	await textureSubmission(client, settings.C32_SUBMIT_1B, settings.C32_SUBMIT_2, 3)
	await textureCouncil(client, settings.C32_SUBMIT_2,  settings.C32_SUBMIT_3, settings.C32_RESULTS, 1)
	await textureRevote(client, settings.C32_SUBMIT_3,  settings.C32_RESULTS,  3)
	
	// Compliance 64x
	await textureSubmission(client, settings.C64_SUBMIT_1,  settings.C64_SUBMIT_2, 3)
	await textureSubmission(client, settings.C64_SUBMIT_1B, settings.C64_SUBMIT_2, 3)
	await textureCouncil(client, settings.C64_SUBMIT_2,  settings.C64_SUBMIT_3, settings.C64_RESULTS, 1)
	await textureRevote(client, settings.C64_SUBMIT_3,  settings.C64_RESULTS,  3)
})
const downloadToBot = new cron.CronJob('10 0 * * *', async () => {
	await getResults(client, settings.C32_RESULTS)
	await getResults(client, settings.C64_RESULTS)
})
let pushToGithub = new cron.CronJob('15 0 * * *', async () => {
	await doPush()
})

/**
 * MODERATION UPDATE INTERVAL
 * @param {int} TIME : in milliseconds
 */
const TIME = 30000
setInterval(function() { checkTimeout(client) }, TIME)

/** 
 * BOT HEARTBEAT:
 * Keep the bot alive on repl.it
 */
const server = http.createServer((req, res) => {
	res.writeHead(302, {
		'Location': 'https://compliancepack.net/'
	})
	res.end()
})
server.listen(PORT, () => console.log(`listening at http://localhost:${PORT}`))

/**
 * COMMAND HANDLER
 * - Automated: /commands & below
 * - Easter Eggs & others: below
 */
let commands = []
for (const file of commandFiles) {
	const command = require(file)
	client.commands.set(command.name, command)

	if (DEBUG) commands.push(command.name)
}
if (DEBUG) console.table(commands)

/**
 * BOT STATUS:
 */
client.on('ready', async () => {
	console.log(`┌─────────────────────────────────────────────────────────────┐`)
	console.log(`│                                                             │`)
	console.log(`│  ─=≡Σ((( つ◕ل͜◕)つ                                           │`)
	console.log(`│ JavaScript is a pain, but I'm fine, I hope...               │`)
	console.log(`│                                                             │`)
	console.log(`└─────────────────────────────────────────────────────────────┘\n\n`)

	if (MAINTENANCE) client.user.setPresence({ activity: { name: 'maintenance' }, status: 'dnd' })
	else client.user.setActivity('/help', {type: 'LISTENING'})

	/**
	 * START TEXTURE SUBMISSION PROCESS
	 * @see submissionProcess
	 * @see downloadToBot
	 * @see pushToGithub
	 */
	submissionProcess.start()
	downloadToBot.start()
	pushToGithub.start()

	/*
	 * UPDATE CTWEAKS MEMBERS
	 */
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER)
	updateMembers(client, settings.C32_ID, settings.C32_COUNTER)

	// get out if no channel, no cache or empty cache
	if(client.channels === undefined || client.channels.cache === undefined || client.channels.cache.length === 0) return

	// get out if history channel not found
	const destinationChannel = client.channels.cache.get('785867553095548948')
	if(destinationChannel === undefined) return

	const embed = new Discord.MessageEmbed()
		.setTitle('Started!')
		.setDescription(`<@!${client.user.id}> \n ID: ${client.user.id}`)
		.setColor(colors.GREEN)
		.setTimestamp()
	await destinationChannel.send(embed)
})

/*
 * MEMBER JOIN
 */
client.on('guildMemberAdd', async member =>{
	// Muted role check:
	for (var i = 0; i < warnList.length; i++) {
		if (`${member.id}` == warnList[i].user && warnList[i].muted == true) {
			const role = member.guild.roles.cache.find(r => r.name === 'Muted')
			await member.roles.add(role)
		}
	}

	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER)
	updateMembers(client, settings.C32_ID, settings.C32_COUNTER)
})

/*
 * MEMBER LEFT
 */
client.on('guildMemberRemove', async () => {
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER)
	updateMembers(client, settings.C32_ID, settings.C32_COUNTER)
})

/*
 * BOT ADD OR REMOVE
 */
client.on('guildCreate', async guild =>{
	var embed = new Discord.MessageEmbed()
		.setTitle(`Thanks for adding me to ${guild.name}!`)
		.addFields(
				{ name: 'Commands', value: `My prefix is: \`${prefix}\` \nUse \`${prefix}help\` to see a list of all my commands!`},
				{ name: 'Feedback', value: `If you have a suggestion or want to report a bug, then please use the command \`${prefix}feedback [your message]\``},
				{ name: 'Personalisation', value: 'soon:tm:'},
			)
		.setColor(colors.BLUE)
		.setThumbnail(settings.BOT_IMG)
		.setFooter(client.user.username, settings.BOT_IMG);

	var channel = guild.channels.cache.find(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has(['EMBED_LINKS', 'SEND_MESSAGES']))
	await channel.send(embed)
})

/*
 * COMMAND HANDLER
 */
client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return // Avoid message WITHOUT prefix & bot messages

	if (MAINTENANCE && !UIDA.includes(message.author.id)) {
		const msg = await message.inlineReply(strings.COMMAND_MAINTENANCE)
		await message.react('❌')
		if (!message.deleted) await msg.delete({timeout: TIME})
	}
	
	const args        = message.content.slice(prefix.length).trim().split(/ +/)
	const commandName = args.shift().toLowerCase()
	const command     = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

	if (!command) return
	if (command.guildOnly && message.channel.type === 'dm') return warnUser(message, strings.CANT_EXECUTE_IN_DMS)

	command.execute(client, message, args).catch(async error => {
		console.error(error)
		const embed = new Discord.MessageEmbed()
			.setColor(colors.RED)
			.setTitle(strings.BOT_ERROR)
			.setDescription(strings.COMMAND_ERROR)

		await message.inlineReply(embed)
		await message.react('❌')
	})
})

/*
 * EASTER EGGS & CUSTOM COMMANDS:
 */
client.on('message', async message => {
	// Avoid message WITH prefix & bot messages
	if (message.content.startsWith(prefix) || message.author.bot) return

	for (var i = 0; i < warnList.length; i++) {
		if (warnList[i].user == message.author.id && warnList[i].muted == true) {
			addMutedRole(client, message.author.id)
		}
	}

	/*
	 * Funny Stuff
	 */
	if (message.content.includes('(╯°□°）╯︵ ┻━┻')) return await message.inlineReply('┬─┬ ノ( ゜-゜ノ) calm down bro')
	if (message.content.toLowerCase().includes('engineer gaming')) return await message.react('👷‍♂️')
	if (message.content === 'F') return await message.react('🇫')

	if (message.content.toLowerCase() === 'mhhh') {
		const embed = new Discord.MessageEmbed()
			.setAuthor(`${message.author.tag} translated: ${message.content}`, message.author.displayAvatarURL())
			.setDescription('```Uh-oh moment```')
			.setColor(colors.BLUE)
			.setFooter('Swahili → English', settings.BOT_IMG)
		return await message.inlineReply(embed)
	}

	if (message.content.toLowerCase() === 'band') {
		const band = ['🎤', '🎸', '🥁', '🎺', '🎹', '🎻']
		band.forEach(async emoji => { await message.react(emoji) })
		return
	}

	if (message.content.toLowerCase() === 'hello there') {
		if (Math.floor(Math.random() * Math.floor(5)) != 1) return await message.channel.send('https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif')
		else return await message.channel.send('https://preview.redd.it/6n6zu25c66211.png?width=960&crop=smart&auto=webp&s=62024911a6d6dd85f83a2eb305df6082f118c8d1')
	}

	/**
	 * MESSAGE URL QUOTE
	 * when someone send a message with https://discord.com/channels/<server ID>/<channel ID>/<message ID>
	 * @author Juknum
	 */
	if (message.content.includes('https://canary.discord.com/channels/') || message.content.includes('https://discord.com/channels/') || message.content.includes('https://discordapp.com/channels')) quote(message)

	/**
	 * DISCORD SERVER INVITE DETECTION
	 * @warn I hope there is no other use of this link type on Discord
	 * Found more information here: https://youtu.be/-51AfyMqnpI
	 * @author RobertR11
	 */
	if (message.content.includes('https://discord.gg/') && message.guild.id != '814198513847631944') inviteDetection(client, message)

	/*
	 * AUTO REACT:
	 * (does not interfer with submission process)
	 */

	// Texture submission Compliance 32x (#submit-texture):
	if (message.channel.id === settings.C32_SUBMIT_1 || message.channel.id === settings.C32_SUBMIT_1B) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture folder of your texture between []:\n`texture_name [folder] (optional comment)`',
			['[',']']
		)
	}

	// Texture submission Compliance 64x (#submit-texture):
	if (message.channel.id === settings.C64_SUBMIT_1 || message.channel.id === settings.C64_SUBMIT_1B) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture folder of your texture between []:\n`texture_name [folder] (optional comment)`',
			['[',']']
		)
	}

	// Texture submission Compliance Dungeons:
	if (message.channel.id === settings.CDUNGEONS_SUBMIT) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture path to your submission:\n`**texture name** (Content/**folder1**/**folder2**/**texture name.png**)`',
			['(',')']
		)
	}

	// Texture submission Emulated Vattic Textures (FHLX):
	if (message.channel.id === '814209343502286899' || message.channel.id === '814201529032114226') {
		return autoReact(
			message,
			['814569395493011477','814569427546144812'],
			strings.SUBMIT_NO_FILE_ATTACHED
		)
	}
})

/*client.on("error", (e) => console.error(e))
client.on("warn", (e) => console.warn(e))
client.on("debug", (e) => console.info(e))
client.on('debug', console.log)

client.on('rateLimit', (e) => console.log(e))*/

}).catch(error => {
	console.trace(error)
})

// Login the bot
client.login(process.env.CLIENT_TOKEN).catch(console.error)