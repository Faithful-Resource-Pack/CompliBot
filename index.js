/* =====================================================
 * COMPLIBOT DISCORD BOT FOR COMPLIANCE, 
 * 	- Developed by the community, for the community.
 * -----------------------------------------------------
 * 	- Developpers:
 * 		- Domi04151309
 * 		- Juknum 
 * 		- RobertR11
 *  
 *  DON'T FORGET TO LOOK TROUGH OUR CHANGELOG
 * =====================================================
 */

// Libs:
require('dotenv').config();
const Discord   = require('discord.js');
const http      = require('http');
const fs        = require('fs');
const cron      = require('cron');
const port      = 3000;
const client    = new Discord.Client({ disableMentions: 'everyone' });
client.commands = new Discord.Collection();

// Admins & settings:
const uidR   = process.env.UIDR;
const prefix = process.env.PREFIX;

// Helpers:
const { jsonModeration } = require('./helpers/fileHandler');
const { autoReact }     = require('./functions/autoReact');
const { updateMembers } = require('./functions/updateMembers.js');
const { walkSync }      = require('./functions/walkSync');

const { quote }    = require('./functions/quote');
const { logs }     = require('./functions/logs');
const { warnUser } = require('./functions/warnUser.js');

const { textureSubmission } = require('./functions/textures_submission/textureSubmission.js');
const { textureCouncil }    = require('./functions/textures_submission/textureCouncil.js');
const { textureRevote }     = require('./functions/textures_submission/textureRevote.js');
const { getResults }        = require('./functions/textures_submission/getResults.js');
const { autoPush }          = require('./functions/autoPush.js');
const { doPush }            = require('./functions/doPush.js');

const { checkTimeout }      = require('./functions/moderation/checkTimeout.js');
const { addMutedRole }      = require('./functions/moderation/addMutedRole.js');
const { keywordsDetection } = require('./functions/moderation/keywordsDetection.js');

// try to read this json
const warnList = jsonModeration.read(false); // YOU MUST NOT LOCK because only read

// Resources:
const colors  = require('./res/colors');
const strings = require('./res/strings');

// Import settings & commands handler:
const commandFiles = walkSync('./commands').filter(file => file.endsWith('.js'));
const settings     = require('./settings');

// Scheduled Functions:
// Texture submission process: (each day at 00:00 GMT)
let scheduledFunctions = new cron.CronJob('0 0 * * *', async () => {
	// C32x
	await textureSubmission(client, settings.C32_SUBMIT_1,  settings.C32_SUBMIT_2, 5);							// 5 DAYS OFFSET
	await textureSubmission(client, settings.C32_SUBMIT_1B, settings.C32_SUBMIT_2, 5);							// 5 DAYS OFFSET
	await    textureCouncil(client, settings.C32_SUBMIT_2,  settings.C32_SUBMIT_3, settings.C32_RESULTS, 1);	// 1 DAYS OFFSET
	await     textureRevote(client, settings.C32_SUBMIT_3,  settings.C32_RESULTS,  3);							// 3 DAYS OFFSET
	
	// C64x
	await textureSubmission(client, settings.C64_SUBMIT_1,  settings.C64_SUBMIT_2, 5);							// 5 DAYS OFFSET
	await textureSubmission(client, settings.C64_SUBMIT_1B, settings.C64_SUBMIT_2, 5);							// 5 DAYS OFFSET
	await    textureCouncil(client, settings.C64_SUBMIT_2,  settings.C64_SUBMIT_3, settings.C64_RESULTS, 1);	// 1 DAYS OFFSET
	await     textureRevote(client, settings.C64_SUBMIT_3,  settings.C64_RESULTS,  3);							// 3 DAYS OFFSET
	
});

// Texture submission push: (each day at 00:10 GMT)
let pushToGithub = new cron.CronJob('10 0 * * *', async () => {
	// Download textures from #results
	await getResults(client, settings.C32_RESULTS);
	await getResults(client, settings.C64_RESULTS);

	await doPush();	// Push them trough GitHub
	await autoPush('Compliance-Resource-Pack', 'JSON', 'main', `Daily update`, `./json`);
});

// Moderation timeout check : (each 30s)
setInterval(function() {checkTimeout(client)},30000)

// Ah, ha, ha, ha, stayin' alive, stayin' alive
// Ah, ha, ha, ha, stayin' alive
// Corona says no ~Domi04151309
const server = http.createServer((req, res) => {
	res.writeHead(302, {
		'Location': 'https://compliancepack.net/'
	});
	res.end();
});
server.listen(3000, () => console.log(`listening at http://localhost:${port}`));

// Bot status:
client.on('ready', async () => {
	if (process.env.MAINTENANCE.toLowerCase() === 'true') {
		client.user.setPresence(
			{
				activity: {
					name: 'maintenance',
					type: 'PLAYING',
					url: 'https://compliancepack.net'
				},
				status: 'dnd'
			}
		);
	}
	else {
		client.user.setPresence(
			{
				activity: {
					name: 'compliancepack.net',
					type: 'PLAYING',
					url: 'https://compliancepack.net'
				},
				status: 'available'
			}
		);
	}

	/*
	 * ENABLE TEXTURE SUBMISSION PROCESS
	 */
	scheduledFunctions.start();
	pushToGithub.start();

	/*
	 * UPDATE MEMBERS
	 */
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER);

	console.log(`--------------------------------------------------------------\n\n\n─=≡Σ((( つ◕ل͜◕)つ\nJavaScript is a pain, but I'm fine, I hope...\n\n\n--------------------------------------------------------------\n`);

	// get out if no channel, no cache or empty cache
	if(client.channels === undefined || client.channels.cache === undefined || client.channels.cache.length === 0)
		return;

	// get out if history channel not found
	const destinationChannel = client.channels.cache.get('785867553095548948');
	if(destinationChannel === undefined)
		return;

	const embed = new Discord.MessageEmbed()
		.setTitle('Started')
		.setDescription(`<@!${client.user.id}> \n ID: ${client.user.id}`)
		.setColor(colors.GREEN)
		.setTimestamp();
	await destinationChannel.send(embed);
});

/*
 * MEMBER JOIN
 */
client.on('guildMemberAdd', async member =>{
	// Muted role check:
	for (var i = 0; i < warnList.length; i++) {
		if (`${member.id}` == warnList[i].user && warnList[i].muted == true) {
			const role = member.guild.roles.cache.find(r => r.name === 'Muted');
			await member.roles.add(role);
		}
	}

	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER);
});

/*
 * MEMBER LEFT
 */
client.on('guildMemberRemove', async member =>{
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER);
});

/*
 * COMMAND HANDLER
 * - Automated: /commands & below
 * - Easter Eggs & others: below
 */
for (const file of commandFiles) {
	const command = require(file);
	client.commands.set(command.name, command);
}

/*
 * AUTOMATED:
 */
client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return; // Avoid message WITHOUT prefix & bot messages

	if (process.env.MAINTENANCE === 'true' && message.author.id !== uidR) {
		const msg = await message.reply(strings.COMMAND_MAINTENANCE);
		await message.react('❌');
		await msg.delete({timeout: 30000});
	}
	
	const args        = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command     = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type === 'dm') {
		return warnUser(message,strings.CANT_EXECUTE_IN_DMS);
	}

	command.execute(client, message, args).catch(async error => {
		console.error(error);
		const embed = new Discord.MessageEmbed()
			.setColor(colors.RED)
			.setTitle(strings.BOT_ERROR)
			.setDescription(strings.COMMAND_ERROR);

		await message.channel.send(embed)
		await message.react('❌');
	})

	/*
	 * COMMAND HISTORY
	 */

	// get out if no channel, no cache or empty cache
	if(client.channels === undefined || client.channels.cache === undefined || client.channels.cache.length === 0)
		return;

	// get out if history channel not found
	const destinationChannel = client.channels.cache.get('785867690627039232');
	if(destinationChannel === undefined)
		return;

	// eventually create the embed and send it

	var embed = new Discord.MessageEmbed()
		.setAuthor(message.author.tag, message.author.displayAvatarURL())
		.setDescription(`[Jump to location](${message.url})\n\n**Command**: \`${commandName}\`\n**Channel**: <#${message.channel.id}>\n**Guild**: \`${message.guild}\`\n**User ID**: \`${message.author.id}\`\n**Message ID**: \`${message.id}\`\n**Command Sent**: \`${message.createdAt}\``)
		.setTimestamp()

	await destinationChannel.send(embed);
});

/*
 * EASTER EGGS & CUSTOM COMMANDS:
 */
client.on('message', async message => {
	for (var i = 0; i < warnList.length; i++) {
		if (warnList[i].user == message.author.id && warnList[i].muted == true) {
			//message.delete();
			addMutedRole(client, message.author.id);
		}
	}

	if (message.content.startsWith(prefix) || message.author.bot) return; // Avoid message WITH prefix & bot messages

	/*
	 * Mod Assistance
	 */
	//keywordsDetection(client, message);

	/*
	 * Funny Stuff
	 */
	if (message.content.includes('(╯°□°）╯︵ ┻━┻')) return await message.reply('┬─┬ ノ( ゜-゜ノ) calm down bro');

	if (message.content === 'F' ) return await message.react('🇫');

	if (message.content.toLowerCase() === 'mhhh') {
		const embed = new Discord.MessageEmbed().setAuthor(message.content, message.author.displayAvatarURL()).setTitle('Uh-oh moment').setFooter('Swahili -> English', settings.BOT_IMG);
		return await message.channel.send(embed);
	}

	if (message.content.toLowerCase() === 'band') {
		await message.react('🎤');
		await message.react('🎸');
		await message.react('🥁');
		await message.react('🎺');
		await message.react('🎹');
		return;
	}

	if (message.content.toLowerCase() === 'hello there') {
		if (Math.floor(Math.random() * Math.floor(5)) != 1) return await message.channel.send('https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif');
		else return await message.channel.send('https://preview.redd.it/6n6zu25c66211.png?width=960&crop=smart&auto=webp&s=62024911a6d6dd85f83a2eb305df6082f118c8d1');
	}

	/*
	 * MESSAGE URL QUOTE
	 * when someone send a message with https://discord.com/channels/<server ID>/<channel ID>/<message ID>
	 */
	if (message.content.includes('https://discord.com/channels/') || message.content.includes('https://discordapp.com/channels')) quote(message);

	/*
	 * DISCORD SERVER INVITE DETECTION
	 * I hope there is no other use of this link type on Discord
	 * Found more information here: https://youtu.be/-51AfyMqnpI
	 */
	if (message.content.includes('https://discord.gg/')) {
		var embed = new Discord.MessageEmbed()
			.setAuthor(`${message.author.tag} may have advertised a discord server`, message.author.displayAvatarURL())
			.setColor(colors.RED)
			.setDescription(`[Jump to message](${message.url})\n\n**Channel**: <#${message.channel.id}>\n**Server**: \`${message.guild}\`\n**User ID**: \`${message.author.id}\`\n**Date**: \`${message.createdAt}\`\n\n\`\`\`${message.content}\`\`\``)
			.setTimestamp()

		client.channels.cache.get('803344583919534091').send(embed)
	}

	/*
	 * AUTO REACT:
	 * (does not interfer with submission process)
	 */

	if (message.channel.id === '779759327665848320') {
		return autoReactMainPack(
			message,
			['⬆️','⬇️'],
			['You need to name your submission!', 'You need to add the folder!', 'You need to add the resource pack type! (java/bedrock)', 'Wrong resource pack type specified! (java/bedrock)'],
			['java', 'bedrock']
		)
	}

	// Texture submission Compliance 32x (#submit-texture):
	if (message.channel.id === settings.C32_SUBMIT_1 || message.channel.id === settings.C32_SUBMIT_1B) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture folder of your texture between []:\n`texture_name [folder] (comment -> optional)`',
			['[',']']
		);
	}

	// Texture submission Compliance 64x (#submit-texture):
	if (message.channel.id === settings.C64_SUBMIT_1 || message.channel.id === settings.C64_SUBMIT_1B) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture folder of your texture between []:\n`texture_name [folder] (comment -> optional)`',
			['[',']']
		);
	}

	// Models submission for Compliance 3D addons
	if (message.channel.id === settings.CADDONS_3D_SUBMIT) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture path to your submission:\n`**texture/model_name** /assets/...`',
			['/assets/']
		);
	}

	// Texture submission Compliance Dungeons:
	if (message.channel.id === settings.CDUNGEONS_SUBMIT) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture path to your submission:\n`**texture name** (Content/**folder1**/**folder2**/**texture name.png**)`',
			['(',')']
		);
	}

	// Texture submission Emulated Vattic Textures (FHLX):
	if (message.channel.id === '814209343502286899' || message.channel.id === '814201529032114226') {
		return autoReact(
			message,
			['✅','❌'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			undefined,
			undefined
		);
	}
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
	if (newMessage.content.startsWith(prefix) || newMessage.author.bot) return; // Avoid message WITH prefix & bot messages

	/*
	 * MODERATION
	 */
	//keywordsDetection(client, newMessage);

	/*
	 * MESSAGE URL QUOTE
	 * when someone sends a message with https://discord.com/channels/<server ID>/<channel ID>/<message ID>
	 */
	if (newMessage.content.includes('https://discord.com/channels/') || newMessage.content.includes('https://discordapp.com/channels')) quote(newMessage);

	/*
	 * MESSAGE LOGS : 
	*/
	if (newMessage.guild.id == settings.C64_ID) logs(client, settings.C64_ID, oldMessage, newMessage, false);
	if (newMessage.guild.id == settings.C32_ID) logs(client, settings.C32_ID, oldMessage, newMessage, false);
});

client.on('messageDelete', async message => {
	if (message.content.startsWith(prefix) || message.author.bot) return; // Avoid message WITH prefix & bot messages
	/*
	 * MESSAGE LOGS : 
	*/
	if (message.guild.id == settings.C64_ID) logs(client, settings.C64_ID, undefined, message, true);
	if (message.guild.id == settings.C32_ID) logs(client, settings.C32_ID, undefined, message, true);
});

// Login the bot
client.login(process.env.CLIENT_TOKEN).catch(console.error);