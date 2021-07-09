/*eslint-env node*/

/**
 * COMPLIBOT MAIN FILE:
 * Developped by and for the Compliance Community.
 */

// Libs:
require('dotenv').config()
const Discord   = require('discord.js')
const cron      = require('cron')
const http      = require('http')
const client    = new Discord.Client({ disableMentions: 'everyone', restTimeOffset: 0, partials: Object.values(Discord.Constants.PartialTypes) })
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
const { warnUser } = require('./helpers/warnUser')
const { walkSync } = require('./helpers/walkSync')

// Functions:
const { updateMembers } = require('./functions/moderation/updateMembers')

const { textureIDQuote } = require('./functions/textures/textureIDQuote')
const { quote }          = require('./functions/quote')

const jiraJE    = require('./functions/minecraftUpdates/jira-je')
const jiraBE    = require('./functions/minecraftUpdates/jira-be')
const minecraft = require('./functions/minecraftUpdates/minecraft')

const { retrieveSubmission } = require('./functions/textures/submission/retrieveSubmission')
const { councilSubmission }  = require('./functions/textures/submission/councilSubmission')
const { revoteSubmission }   = require('./functions/textures/submission/revoteSubmission')
const { downloadResults }    = require('./functions/textures/admission/downloadResults')
const { pushTextures }       = require('./functions/textures/admission/pushTextures')

const { checkTimeout }    = require('./functions/moderation/checkTimeout')
const { inviteDetection } = require('./functions/moderation/inviteDetection')

const { submitTexture }  = require('./functions/textures/submission/submitTexture')
const { editSubmission } = require('./functions/textures/submission/editSubmission')
const { saveDB } = require('./functions/saveDB')

const { manageExtraRoles } = require('./functions/manageExtraRoles')

// Resources:
const colors  = require('./resources/colors')
const strings = require('./resources/strings')

// Import settings & commands handler:
const commandFiles = walkSync('./commands').filter(file => file.endsWith('.js'))
const settings     = require('./resources/settings')
const { addDeleteReact }     = require('./helpers/addDeleteReact')
const { restartAutoDestroy } = require('./functions/restartAutoDestroy')

/**
 * SCHEDULED FUNCTIONS : Texture Submission
 * - Global process (each day at 00:00 GMT)         : @function submissionProcess
 * - Download process (each day at 00:10 GMT)       : @function downloadToBot
 * - Push to GitHub process (each day at 00:15 GMT) : @function pushToGithub
 */
const submissionProcess = new cron.CronJob('0 0 * * *', async () => {
	// Compliance 32x
	await retrieveSubmission(client, settings.C32_SUBMIT_TEXTURES, settings.C32_SUBMIT_COUNCIL, 3)
	await councilSubmission(client, settings.C32_SUBMIT_COUNCIL, settings.C32_RESULTS, settings.C32_SUBMIT_REVOTE, 1)
	await revoteSubmission(client, settings.C32_SUBMIT_REVOTE, settings.C32_RESULTS, 3)
	
	// Compliance 64x
	await retrieveSubmission(client, settings.C64_SUBMIT_TEXTURES, settings.C64_SUBMIT_COUNCIL, 3)
	await councilSubmission(client, settings.C64_SUBMIT_COUNCIL, settings.C64_RESULTS, settings.C64_SUBMIT_REVOTE, 1)
	await revoteSubmission(client, settings.C64_SUBMIT_REVOTE, settings.C64_RESULTS, 3)
})
const downloadToBot = new cron.CronJob('15 0 * * *', async () => {
	await downloadResults(client, settings.C32_RESULTS)
	await downloadResults(client, settings.C64_RESULTS)
})
let pushToGithub = new cron.CronJob('30 0 * * *', async () => {
	await pushTextures()
	await saveDB(`Daily Backup`)
})

function doMCUpdateCheck () {
	jiraJE.updateJiraVersions(client)
	jiraBE.updateJiraVersions(client)
	minecraft.updateMCVersions(client)
}

/** 
 * BOT HEARTBEAT:
 * Keep the bot alive on repl.it
 */
http.createServer((req, res) => {
  res.write("h");
  res.end();
}).listen(PORT, () => console.log(`listening at http://localhost:${PORT}`));

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
	console.log(`│  ─=≡Σ((( つ◕ل͜◕)つ                                         │`)
	console.log(`│ JavaScript is a pain, but I'm fine, I hope...               │`)
	console.log(`│                                                             │`)
	console.log(`└─────────────────────────────────────────────────────────────┘\n\n`)

	if (MAINTENANCE) client.user.setPresence({ activity: { name: 'maintenance' }, status: 'dnd' })
	else client.user.setActivity(`${prefix}help`, {type: 'LISTENING'})

	await restartAutoDestroy(client)

	/**
	 * START TEXTURE SUBMISSION PROCESS
	 * @see submissionProcess
	 * @see downloadToBot
	 * @see pushToGithub
	 */
	submissionProcess.start()
	downloadToBot.start()
	pushToGithub.start()

	/**
	 * MINECRAFT UPDATE DETECTION INTERVAL
	 * @param {int} TIME : in milliseconds
	 */
	await jiraJE.loadJiraVersions()
	await jiraBE.loadJiraVersions()
	await minecraft.loadMCVersions()
	setInterval(() => doMCUpdateCheck(), 60000)

	/**
	 * MODERATION MUTE SYSTEM UPDATE INTERVAL
	 * @param {int} TIME : in milliseconds
	 */
	setInterval(function () { checkTimeout(client) }, 30000)

	/**
	 * UPDATE MEMBERS
	 */
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER)
	updateMembers(client, settings.C32_ID, settings.C32_COUNTER)
})

/**
 * MEMBER JOIN
 */
client.on('guildMemberAdd', async () =>{
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER)
	updateMembers(client, settings.C32_ID, settings.C32_COUNTER)
})

/**
 * MEMBER LEFT
 */
client.on('guildMemberRemove', async () => {
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER)
	updateMembers(client, settings.C32_ID, settings.C32_COUNTER)
})

/**
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

/**
 * COMMAND HANDLER
 */
client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return // Avoid messages WITHOUT prefix & bot messages

	if (MAINTENANCE && !UIDA.includes(message.author.id)) {
		const msg = await message.inlineReply(strings.COMMAND_MAINTENANCE)
		await message.react('❌')
		if (!message.deleted) await msg.delete({timeout: 30000})
	}
	
	const args        = message.content.slice(prefix.length).trim().split(/ +/)
	const commandName = args.shift().toLowerCase()
	const command     = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

	if (!command) return
	if (command.guildOnly && message.channel.type === 'dm') return warnUser(message, strings.CANT_EXECUTE_IN_DMS)

	command.execute(client, message, args).catch(async error => {
		const embed = new Discord.MessageEmbed()
			.setColor(colors.RED)
			.setTitle(strings.BOT_ERROR)
			.setThumbnail(settings.ERROR_IMG)
			.setDescription(`${strings.COMMAND_ERROR}\nError for the developers:\n${error}`)

		let msgEmbed = await message.inlineReply(embed)
		await message.react('❌')
		return addDeleteReact(msgEmbed, message, true)
	})
})

/**
 * REACTION EVENT LISTENER
 */
client.on('messageReactionAdd', async (reaction, user) => {
	if (user.bot) return
	if (reaction.message.partial) await reaction.message.fetch() // dark magic to fetch message that are sent before the start of the bot
	
	/**
	 * NEW TEXTURE SUBMISSION
	 */
	if (
		reaction.message.channel.id === settings.C32_SUBMIT_TEXTURES || // c32x server
		reaction.message.channel.id === settings.C32_SUBMIT_COUNCIL  || 
		reaction.message.channel.id === settings.C32_SUBMIT_REVOTE   || 
		reaction.message.channel.id === settings.C32_RESULTS         ||

		reaction.message.channel.id === settings.C64_SUBMIT_TEXTURES || // c64x server
		reaction.message.channel.id === settings.C64_SUBMIT_COUNCIL  ||
		reaction.message.channel.id === settings.C64_SUBMIT_REVOTE   ||
		reaction.message.channel.id === settings.C64_RESULTS         ||

		reaction.message.channel.id === settings.CDUNGEONS_SUBMIT // dungeons server REMOVE THIS ASAP
		) editSubmission(client, reaction, user)
	
	if (reaction.message.channel.id === settings.CEXTRAS_ROLES) manageExtraRoles(client, reaction, user)
})

/**
 * EASTER EGGS & CUSTOM COMMANDS:
 */
client.on('message', async message => {
	// Avoid message WITH prefix & bot messages
	if (message.content.startsWith(prefix) || message.author.bot) return

	/**
	 * EASTER EGGS
	 */
	if (message.content.includes('(╯°□°）╯︵ ┻━┻')) return await message.inlineReply('┬─┬ ノ( ゜-゜ノ) calm down bro')
	if (message.content.toLowerCase().includes('engineer gaming')) return await message.react('👷‍♂️')
	if (message.content === 'F') return await message.react('🇫')

	if (message.content.toLowerCase() === 'mhhh') {
		const embed = new Discord.MessageEmbed()
			.setDescription('```Uh-oh moment```')
			.setColor(colors.BLUE)
			.setFooter('Swahili → English', settings.BOT_IMG)
		let msgEmbed = await message.inlineReply(embed)
		return addDeleteReact(msgEmbed, message)
	}

	if (message.content.toLowerCase() === 'band') {
		return ['🎤', '🎸', '🥁', '🪘', '🎺', '🎷', '🎹', '🪗', '🎻'].forEach(async emoji => { await message.react(emoji) })
	}

	if (message.content.toLowerCase() === 'monke') {
		return ['🎷','🐒'].forEach(async emoji => { await message.react(emoji) })
	}

	if (message.content.toLowerCase() === 'hello there') {
		let msgEmbed
		if (Math.floor(Math.random() * Math.floor(5)) != 1) msgEmbed = await message.inlineReply('https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif')
		else msgEmbed = await message.inlineReply('https://preview.redd.it/6n6zu25c66211.png?width=960&crop=smart&auto=webp&s=62024911a6d6dd85f83a2eb305df6082f118c8d1')

		return addDeleteReact(msgEmbed, message)
	}

	/**
	 * MESSAGE URL QUOTE
	 * when someone send a message with https://discord.com/channels/<server ID>/<channel ID>/<message ID>
	 * @author Juknum
	 */
	if (
		message.content.includes('https://canary.discord.com/channels/') || 
		message.content.includes('https://discord.com/channels/')        || 
		message.content.includes('https://discordapp.com/channels')
	)	quote(message)

	/**
	 * TEXTURE ID QUOTE
	 * when someone type [#1234], send an embed with the given texture id
	 * @author Juknum
	 */
	textureIDQuote(message)

	/**
	 * DISCORD SERVER INVITE DETECTION
	 * @warn I hope there is no other use of this link type on Discord
	 * Found more information here: https://youtu.be/-51AfyMqnpI
	 * @author RobertR11
	 */
	if (message.content.includes('https://discord.gg/') && message.guild.id != '814198513847631944') inviteDetection(client, message)

	/**
	 * TEXTURE SUBMISSION
	 */
	if (
		message.channel.id === settings.C32_SUBMIT_TEXTURES ||
		message.channel.id === settings.C64_SUBMIT_TEXTURES ||
		message.channel.id === settings.CDUNGEONS_SUBMIT
	) return submitTexture(client, message)

	/**
	 * EMULATED VATTIC TEXTURES BASIC AUTOREACT (FHLX's server)
	 */
	if (message.channel.id === '814209343502286899' || message.channel.id === '814201529032114226') {
		if (!message.attachments.size) {
			if (message.member.hasPermission('ADMINISTRATOR')) return
			var embed = new Discord.MessageEmbed()
				.setColor(colors.RED)
				.setTitle(strings.SUBMIT_AUTOREACT_ERROR_TITLE)
				.setDescription(strings.SUBMIT_NO_FILE_ATTACHED)
				.setFooter('Submission will be removed in 30 seconds, please re-submit', settings.BOT_IMG)

			const msg = await message.inlineReply(embed)
			if (!msg.deleted) await msg.delete({timeout: 30000})
			if (!message.deleted) await message.delete({timeout: 10})
		} else {
			await message.react('814569395493011477')
			await message.react('814569427546144812')
		}
	}

})

// eslint-disable-next-line no-unused-vars
process.on('unhandledRejection', (reason, promise) => {
	const errorChannel = client.channels.cache.find(channel => channel.id == "853547435782701076")
	const errorEmbed = new Discord.MessageEmbed()
		.setTitle('Unhandled Rejection:')
		.setDescription("```fix\n" + (reason.stack || reason) +"```")
		.setColor(colors.RED)
		.setTimestamp()

	errorChannel.send(errorEmbed)
})

// Login the bot
client.login(process.env.CLIENT_TOKEN).catch(console.error)