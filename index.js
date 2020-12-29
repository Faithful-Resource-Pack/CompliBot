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
uidR   = process.env.UIDR;
uidJ   = process.env.UIDJ;
prefix = process.env.PREFIX;

// Import settings & commands handler:
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const settings     = require('./settings');
const speech       = require('./messages');

// Helpers (the start of modularization ew) 
///// look at the /functions folder to a working example
const { votingHelper } = require('./helpers/voting.js');

// Functions:
const { countReact }    = require('./functions/countReact.js');
const { attachIsImage } = require('./functions/attachIsImage.js');
const { getMessages }   = require('./functions/getMessages.js');
const { updateMembers } = require('./functions/updateMembers.js');

const { textureSubmission } = require('./functions/textures_submission/textureSubmission');
const { textureCouncil }    = require('./functions/textures_submission/textureCouncil');
const { textureRevote }     = require('./functions/textures_submission/textureRevote');

// Scheduled Functions:
// Texture submission process: (each day at 00:00 GMT)
let scheduledFunctions = new cron.CronJob('0 0 * * *', () => {
	textureSubmission(client,settings.C32_SUBMIT_1,settings.C32_SUBMIT_2,5);									// 5 DAYS OFFSET
	textureCouncil(client,settings.C32_SUBMIT_2,settings.C32_SUBMIT_3,settings.C32Results,1);	// 1 DAYS OFFSET
	textureRevote(client,settings.C32_SUBMIT_3,settings.C32_RESULTS,3);											  // 3 DAYS OFFSET
});

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

  /*
	 * UPDATE MEMBERS 
	*/
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER);

  var embed = new Discord.MessageEmbed()
    .setTitle('Started')
    .setDescription(`<@!${client.user.id}> \n ID: ${client.user.id}`)
    .setColor('#49d44d')
    .setTimestamp();
  await client.channels.cache.get('785867553095548948').send(embed);
});

client.on('reconnecting', async () => {
	var embed = new Discord.MessageEmbed()
    .setTitle('Reconnecting...')
    .setDescription(`<@!${client.user.id}> \n ID: ${client.user.id}`)
    .setColor('#ffff00')
    .setTimestamp();
  await client.channels.cache.get('785867553095548948').send(embed);
});

client.on('disconnect', async () => {
	var embed = new Discord.MessageEmbed()
    .setTitle('Disconnect...')
    .setDescription(`<@!${client.user.id}> \n ID: ${client.user.id}`)
    .setColor('#ff0000')
    .setTimestamp();
  await client.channels.cache.get('785867553095548948').send(embed);
});

/*
 * MEMBERS COUNTER
*/
client.on('guildMemberAdd', async member =>{
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER);
});
client.on('guildMemberRemove', async member =>{
	updateMembers(client, settings.CTWEAKS_ID, settings.CTWEAKS_COUNTER);
});

/*
 * COMMANDS HANDLER
 * - Automated: /commands & below
 * - Easter Eggs & others: below
*/
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

/*
 * AUTOMATED:
*/
client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return; // Avoid message WITHOUT prefix & bot messages
  if (process.env.MAINTENANCE === 'true' && message.author.id !== uidR) {
		const msg = await message.reply(speech.COMMAND_MAINTENANCE);
    await message.react('❌');
    await msg.delete({timeout: 30000});
  }

	const args        = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command     = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	try {
		command.execute(client, message, args);
	}	catch (error) {
		console.error(error);
    const embed = new Discord.MessageEmbed()
	    .setColor(settings.COLOR_RED)
      .setTitle(speech.BOT_ERROR)
      .setDescription(speech.COMMAND_ERROR);

		const embedMessage = await message.channel.send(embed)
    await message.react('❌');
    await embedMessage.delete({timeout: 30000});
	}

	/*
	 * COMMANDS HISTORY
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
	 * AUTO REACT:
	 * (does not interfer with submission process)
	*/

	// Texture submission Compliance 32x (submit-texture):
	if (message.channel.id === settings.C32_SUBMIT_1) {
		if (message.attachments.size > 0) {
			try {
				await message.react('⬆️');
				await message.react('⬇️');
			} catch (error) {
				console.error('ERROR | One of the emojis failed to react!' + error);
			}

		} else if(!message.member.roles.cache.has(settings.C32_MODERATORS_ID)) {
      await message.delete();

      var embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
	      .setColor(settings.COLOR_RED)
        .setTitle(speech.BOT_ERROR)
        .setDescription('Your texture submission has to have a file attached!');

		  const msg = await message.channel.send(embed);
      await msg.delete({timeout: 30000});
		}
	}

	// Texture submission Compliance 32x (council-vote & texture-revote):
	if (message.channel.id === settings.C32_SUBMIT_2 || message.channel.id === settings.C32_SUBMIT_3) {
		if (message.attachments.size > 0) {
			if (message.attachments.every(attachIsImage)){
				try {
					await message.react('⬆️');
					await message.react('⬇️');
				} catch (error) {
					console.error('ERROR | One of the emojis failed to react!' + error);
				}
			}
		}
	}

	// Models submission for Compliance 3D addons
	if (message.channel.id === settings.CADDONS_3D_SUBMIT) {
		if (message.attachments.size > 0) {
			if (!message.content.includes('/assets/')) {
				const msg = await message.reply('you need to add the texture path to your texture submission, following this example: `**texture/model name** /assets/...`')
				await message.react('❌');
				await msg.delete({timeout: 30000});
			} else try {
				await message.react('⬆️');
				await message.react('⬇️');
			} catch (error) { 
				console.error('ERROR | One of the emojis failed to react!' + error);
			}
		} else {
			const msg = await message.reply('your texture submission needs to have a file attached!')
			await message.react('❌');
			await msg.delete({timeout: 30000});
		}
	}

	// Texture submission Compliance Dungeons:
	if (message.channel.id === settings.CDUNGEONS_SUBMIT) {
		if (message.attachments.size > 0) {
			if (message.attachments.every(attachIsImage)){

				if(!message.content.includes('(')) {
					const msg = await message.reply('you need to add the texture path to your texture submission, follow this example: `**texture name** (Content/**folder1**/**folder2**/**texture name.png**)`')
					await message.react('❌');
					await msg.delete({timeout: 30000});
				} else try {
					await message.react('⬆️');
					await message.react('⬇️');
				} catch (error) { 
					console.error('ERROR | One of the emojis failed to react!' + error);
				}

			} else {
				const msg = await message.reply('you need to attach a png file!')
				await message.react('❌');
				await msg.delete({timeout: 30000});
			}
		} else {
			const msg = await message.reply('your texture submission needs to have an image attached!')
			await message.react('❌');
			await msg.delete({timeout: 30000});
		}
	}
});

// Login the bot
client.login(process.env.CLIENT_TOKEN).catch(console.error);