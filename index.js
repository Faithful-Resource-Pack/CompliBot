/*
 *    /---------\      \|/
 *   /           \    --O--
 *  /             \    /|\
 *  |    (\_/)    | 
 *  |   (='.'=)   |  <-- Juk's little vacation house
 *  |   (")_(")   |  Yeah, that's true, Juk.
 *  %_____________%
 */

// Libs:
require('dotenv').config();
const Discord   = require('discord.js');
const http      = require('http');
const fs        = require('fs');
const cron      = require('cron');
const port      = 3000;
const client    = new Discord.Client();
client.commands = new Discord.Collection();

// Admins & settings :
const uidR   = process.env.UIDR;
const prefix = process.env.PREFIX;

// Helpers
const { autoReact }     = require('./functions/autoReact');
const { updateMembers } = require('./functions/updateMembers.js');
const { walkSync }      = require('./functions/walkSync');

const { quote } = require('./functions/quote');
const { logs }  = require('./functions/logs');

const { textureSubmission } = require('./functions/textures_submission/textureSubmission');
const { textureCouncil }    = require('./functions/textures_submission/textureCouncil');
const { textureRevote }     = require('./functions/textures_submission/textureRevote');
const { getResults }        = require('./functions/textures_submission/getResults.js');
const { autoPush }          = require('./functions/autoPush.js');
const { doPush }            = require('./functions/doPush.js');

// Resources
const colors  = require('./res/colors');
const strings = require('./res/strings');

// Import settings & commands handler:
const commandFiles = walkSync('./commands').filter(file => file.endsWith('.js'));
const settings     = require('./settings');

// Scheduled Functions:
// Texture submission process: (each day at 00:00 GMT)
let scheduledFunctions = new cron.CronJob('0 0 * * *', () => {
	// C32x
	textureSubmission(client,settings.C32_SUBMIT_1,settings.C32_SUBMIT_2,5);									  // 5 DAYS OFFSET
	textureCouncil(client,settings.C32_SUBMIT_2,settings.C32_SUBMIT_3,settings.C32_RESULTS,1);	// 1 DAYS OFFSET
	textureRevote(client,settings.C32_SUBMIT_3,settings.C32_RESULTS,3);											    // 3 DAYS OFFSET
	
	// C64x
	textureSubmission(client,settings.C64_SUBMIT_1,settings.C64_SUBMIT_2,5);									  // 5 DAYS OFFSET
	textureCouncil(client,settings.C64_SUBMIT_2,settings.C64_SUBMIT_3,settings.C64_RESULTS,1);	// 1 DAYS OFFSET
	textureRevote(client,settings.C64_SUBMIT_3,settings.C64_RESULTS,3);											    // 3 DAYS OFFSET
});

// Texture submission push: (each day at 02:00 GMT)
let pushToGithub = new cron.CronJob('0 2 * * *', () => {
	// Download textures from #results
	getResults(client, settings.C32_RESULTS);
	getResults(client, settings.C64_RESULTS);
	// Push them trough GitHub
	doPush();
	// Update Contributors
	autoPush('Compliance-Resource-Pack', 'Contributors', 'main', `Daily update`, `./contributors`);
});

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

  var embed = new Discord.MessageEmbed()
    .setTitle('Started')
    .setDescription(`<@!${client.user.id}> \n ID: ${client.user.id}`)
    .setColor(colors.GREEN)
    .setTimestamp();
  await client.channels.cache.get('785867553095548948').send(embed);
});

/* unused or not working stuff, idk

client.on('reconnecting', async () => {
	var embed = new Discord.MessageEmbed()
    .setTitle('Reconnecting...')
    .setDescription(`<@!${client.user.id}> \n ID: ${client.user.id}`)
    .setColor(colors.YELLOW)
    .setTimestamp();
  await client.channels.cache.get('785867553095548948').send(embed);
});

client.on('disconnect', async () => {
	var embed = new Discord.MessageEmbed()
    .setTitle('Disconnect...')
    .setDescription(`<@!${client.user.id}> \n ID: ${client.user.id}`)
    .setColor(colors.RED)
    .setTimestamp();
  await client.channels.cache.get('785867553095548948').send(embed);
});*/

/*
 * MEMBER COUNTER
*/
client.on('guildMemberAdd', async member =>{
  /*if (member.guild.id == '773983706582482946') {
    var embed = new Discord.MessageEmbed()
	  	.setAuthor(`${member.tag} joined`)
	  	.setColor(colors.GREEN)
	  	//.setThumbnail(member.displayAvatarURL())
	  	.setTimestamp()

	  await member.guild.channels.cache.get('774333964101615637').send(embed);
  }*/

	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER);
});
client.on('guildMemberRemove', async member =>{
  /*if (member.guild.id == '773983706582482946') {
    var embed = new Discord.MessageEmbed()
	  	.setAuthor(`${member.tag} left`)
	  	.setColor(colors.RED)
	  	//.setThumbnail(member.displayAvatarURL())
	  	.setTimestamp()

	  await member.guild.channels.cache.get('774333964101615637').send(embed);
  }*/

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

  command.execute(client, message, args).catch(async error => {
    console.error(error);
    const embed = new Discord.MessageEmbed()
      .setColor(colors.RED)
      .setTitle(strings.BOT_ERROR)
      .setDescription(strings.COMMAND_ERROR);

		const embedMessage = await message.channel.send(embed)
    await message.react('❌');
    await embedMessage.delete({timeout: 30000});
  })

	/*
	 * COMMAND HISTORY
	*/
  var embed = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL())
		.setDescription(`command: \`${commandName}\` \n args: \`${args}\``)
		.setTimestamp()
    .setFooter(`executed in: ${message.guild} \n\u200B`);
  await client.channels.cache.get('785867690627039232').send(embed);
});

/*
 * EASTER EGGS & CUSTOM COMMANDS:
*/
client.on('message', async message => {
	if (message.content.startsWith(prefix) || message.author.bot) return; // Avoid message WITH prefix & bot messages

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
	if (message.content.includes('https://discord.com/channels/')) quote(message);

	/*
	 * AUTO REACT:
	 * (does not interfer with submission process)
	*/

	// Texture submission Compliance 32x (#submit-texture):
	if (message.channel.id === settings.C32_SUBMIT_1) {
		return autoReact(
			message,
			['⬆️','⬇️'],
			strings.SUBMIT_NO_FILE_ATTACHED,
			'You need to add the texture folder of your texture between []:\n`texture_name [folder] (comment -> optional)`',
			['[',']']
		);
	}

	// Texture submission Compliance 64x (#submit-texture):
	if (message.channel.id === settings.C64_SUBMIT_1) {
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
	if (message.channel.id === '767464832285933578') {
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
	 * MESSAGE URL QUOTE
	 * when someone sends a message with https://discord.com/channels/<server ID>/<channel ID>/<message ID>
	*/
	if (newMessage.content.includes('https://discord.com/channels/')) quote(newMessage);

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
// 01101000 01110100 01110100 01110000 01110011 00111010 00101111 00101111 01111001 01101111 01110101 01110100 01110101 00101110 01100010 01100101 00101111 01100100 01010001 01110111 00110100 01110111 00111001 01010111 01100111 01011000 01100011 01010001
client.login(process.env.CLIENT_TOKEN).catch(console.error);
