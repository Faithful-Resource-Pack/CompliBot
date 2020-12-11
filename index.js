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
const settings     = require('./settings.js');

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Ah, ha, ha, ha, stayin' alive, stayin' alive
// Ah, ha, ha, ha, stayin' alive
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Hey, this is a Discord bot, not a website! Our actual website is https://compliancepack.net/');
});
server.listen(3000, () => console.log(`listening at http://localhost:${port}`));

// Bot status:
client.on('ready', async () => {
	if (process.env.MAINTENANCE === 'true') client.user.setPresence({ activity: { name: 'maintenance' }, status: 'dnd' });
	else client.user.setActivity('compliancepack.net', {type: 'PLAYING'});
	
	console.log('Starting submission functions...');
	scheduledFunctions.start();

  console.log('Updating member counters...');
	updateMembers(settings.CTweaksID, settings.CTweaksCounter);

	console.log('JavaScript is a pain, but i\'m fine, i hope...');
});

async function updateMembers (serverID, channelID) {
  let guild = client.guilds.cache.get(serverID);
	await guild.channels.cache.get(channelID).setName('Members: ' + guild.memberCount);
}

// Member counter
client.on('guildMemberAdd', async member =>{
  updateMembers(settings.CTweaksID, settings.CTweaksCounter);
});
client.on('guildMemberRemove', async member =>{
	updateMembers(settings.CTweaksID, settings.CTweaksCounter);
});

// Command handler
client.on('message', message => {
	// Avoid message WITHOUT prefix & bot messages
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args        = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command     = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;
	//if (message.channel.type === 'dm') return message.reply('My creators don\'t allow me to execute commands inside DMs, sorry!');

	try {
		command.execute(message, args);
	}	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.on('message', async message => {
	// Avoid message WITH prefix & bot messages
	if (message.content.startsWith(prefix) || message.author.bot) return;

	/*
	 * SHORTS COMMANDS 
	 * (easter eggs)
	*/

	if (message.content.includes('(╯°□°）╯︵ ┻━┻')) await message.reply('┬─┬ ノ( ゜-゜ノ) calm down bro');
	
	else if (message.content === 'F' ) await message.react('🇫');

	else if (message.content.toLowerCase() === 'mhhh') {
		const embed = new Discord.MessageEmbed().setTitle('Uh-oh moment').setFooter('Swahili -> English', settings.BotIMG);
		await message.channel.send(embed);
	}

	else if (message.content.toLowerCase() === 'band') {
		await message.react('🎤');
		await message.react('🎸');
		await message.react('🥁');
		await message.react('🎺');
		await message.react('🎹');
	}
	else if (message.content.toLowerCase() === 'hello there') {
		const GIF1 = 'https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif';
		const GIF2 = 'https://preview.redd.it/6n6zu25c66211.png?width=960&crop=smart&auto=webp&s=62024911a6d6dd85f83a2eb305df6082f118c8d1';
		if (Math.floor(Math.random() * Math.floor(5)) != 1) await message.channel.send(GIF1);
		else await message.channel.send(GIF2);
	}

	/*
	 * AUTO REACT:
	 * (do not interfer with submission process)
	*/

	// Texture submission Compliance 32x (submit-texture):
	else if (message.channel.id === settings.C32Submit1) {
		if (message.attachments.size > 0) {
			try {
				await message.react('⬆️');
				await message.react('⬇️');
			} catch (error) {
				console.error('ERROR | One of the emojis failed to react!' + error);
			}

		} else if(!message.member.roles.cache.has(settings.C32ModsID)) {
			await message.reply('your texture submission needs to have an file attached!').then(async msg => {
				await message.react('❌');
				await msg.delete({timeout: 30000});
			});
		}
	}

	// Texture submission Compliance 32x (council-vote & texture-revote):
	else if (message.channel.id === settings.C32Submit2 || message.channel.id === settings.C32Submit3) {
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
	else if (message.channel.id === settings.CAddons3DSubmit) {
		if (message.attachments.size > 0) {
			if (!message.content.includes('/assets/')) {
				await message.reply('you need to add the texture path to your texture submission, following this example: `**texture/model name** /assets/...`').then(async msg => {
					await message.react('❌');
					await msg.delete({timeout: 30000});
				});
			} else try {
				await message.react('⬆️');
				await message.react('⬇️');
			} catch (error) { 
				console.error('ERROR | One of the emojis failed to react!' + error);
			}
		} else {
			await message.reply('your texture submission needs to have a file attached!').then(async msg => {
				await message.react('❌');
				await msg.delete({timeout: 30000});
			});
		}
	}

	// Texture submission Compliance Dungeons:
	else if (message.channel.id === settings.CDungeonsSubmit) {
		if (message.attachments.size > 0) {
			if (message.attachments.every(attachIsImage)){

				if(!message.content.includes('(')) {
					await message.reply('you need to add the texture path to your texture submission, follow this example: `**texture name** (Content/**folder1**/**folder2**/**texture name.png**)`').then(async msg => {
						await message.react('❌');
						await msg.delete({timeout: 30000});
					});
				} else try {
					await message.react('⬆️');
					await message.react('⬇️');
				} catch (error) { 
					console.error('ERROR | One of the emojis failed to react!' + error);
				}

			} else {
				await message.reply('you need to attach a png file!').then(async msg => {
					await message.react('❌');
					await msg.delete({timeout: 30000});
				});
			}
		} else {
			await message.reply('your texture submission needs to have an image attached!').then(async msg => {
				await message.react('❌');
				await msg.delete({timeout: 30000});
			});
		}
	}

	// Texture submission Faithful Traditional:
	else if (message.channel.id === settings.FTraditionalSubmit) {
		if (message.attachments.size > 0) {
			try {
				await message.react('✅');
				await message.react('❌');
			} catch (error) {
				console.error('ERROR | One of the emojis failed to react!' + error);
			}
		} else if(!message.member.roles.cache.has('766856790004072450')) {
			await message.reply('your texture submission needs to have an file attached!').then(async msg => {
				await message.react('❌');
				await msg.delete({timeout: 30000});
			});
		}
	}
});

// Texture submission process: (each day at 00:00 GMT)
let scheduledFunctions = new cron.CronJob('00 00 * * *', () => {
	textureSubmission(settings.C32Submit1,settings.C32Submit2,5);									// 5 DAYS OFFSET
	councilVoting(settings.C32Submit2,settings.C32Submit3,settings.C32Results,1);	// 1 DAYS OFFSET
	textureRevote(settings.C32Submit3,settings.C32Results,3);											// 3 DAYS OFFSET
});

// Texture submission process: checking textures from #texture-revote
async function textureRevote (inputID, outputID, offset) {
	const revoteSentence = 'The following texture has not passed council voting and thus is up for revote:\n';

	let channelOutput = client.channels.cache.get(outputID);
	let limitDate     = new Date();

	limitDate.setDate(limitDate.getDate() - offset);

	let messages = await getMessages(inputID);
	console.log(`${messages.length} messages in #texture-revote`);
	
	for (var i in messages) {
		let message     = messages[i];
		let messageDate = new Date(message.createdTimestamp);

		let messageUpvote    = countReact(message,'⬆️');
		let messageDownvote  = countReact(message,'⬇️');
		let upvotePercentage = ((messageUpvote * 100) / (messageUpvote + messageDownvote)).toFixed(2);

		if (upvotePercentage > 66.66 &&	message.attachments.size > 0 && messageDate.getDate() == limitDate.getDate() &&	messageDate.getMonth() == limitDate.getMonth()) {
			await channelOutput.send(`This texture has passed community voting and thus will be added into the pack.\n> With a percentage of ${upvotePercentage}% Upvotes (>66%).\n` + message.content.replace(revoteSentence,''), {files: [message.attachments.first().url]})
			.then(async message => {
				try {
					await message.react('✅');
				} catch (error) {
					console.error(error);
				}
			});
		} else if (message.attachments.size > 0 && messageDate.getDate() == limitDate.getDate() &&	messageDate.getMonth() == limitDate.getMonth()) {
			await channelOutput.send(`This texture has not passed council and community voting (${upvotePercentage}% of upvotes), and thus will not be added into the pack.\n` + message.content.replace(revoteSentence,''), {files: [message.attachments.first().url]})
			.then(async message => {
				try {
					await message.react('❌');
				}	catch (error) {
					console.error(error);
				}
			});
		}
	}
}

// Texture submission process: checking texture in #council-vote
async function councilVoting (inputID, outputFalseID, outputTrueID, offset) {
	const trueSentence  = 'The following texture has passed council voting and will be added into the pack in a future version.\n';
	const falseSentence = 'The following texture has not passed council voting and thus is up for revote:\n';

	let channelRevote  = client.channels.cache.get(outputFalseID);
	let channelResults = client.channels.cache.get(outputTrueID);

	let limitDate = new Date();
	limitDate.setDate(limitDate.getDate() - offset);

	let messages = await getMessages(inputID);
	console.log(`${messages.length} messages in #council-vote`);
	
	for (var i in messages) {
		let message     = messages[i];
		let messageDate = new Date(message.createdTimestamp);
		let messageUpvote   = countReact(message,'⬆️');
		let messageDownvote = countReact(message,'⬇️');

		if (messageUpvote > messageDownvote && message.attachments.size > 0 && messageDate.getDate() == limitDate.getDate() && messageDate.getMonth() == limitDate.getMonth()) {
			await channelResults.send(trueSentence + message.content, {files: [message.attachments.first().url]})
			.then(async message => {
				try {
					await message.react('✅');
				} catch (error)	{
					console.error(error);
				}
			});
		} else if (message.attachments.size > 0 && messageDate.getDate() == limitDate.getDate() && messageDate.getMonth() == limitDate.getMonth()) {
			await channelRevote.send(falseSentence + message.content, {files: [message.attachments.first().url]})
			.then(async message => {
				try {
					await message.react('⬆️');
					await message.react('⬇️');
				} catch (error) {
					console.error(error);
				}
			});
		}
	}
}

// Texture submission process: checking texture from #submit-texture
async function textureSubmission (inputID, outputID, offset) {
	let channelOutput = client.channels.cache.get(outputID); 

	let limitDate = new Date();
	limitDate.setDate(limitDate.getDate() - offset);

	let messages = await getMessages(inputID);
	console.log(`${messages.length} messages in textures submission`);
	
	for (var i in messages) {
		let message         = messages[i];
		let messageDate     = new Date(message.createdTimestamp);
		let messageUpvote   = countReact(message,'⬆️');
		let messageDownvote = countReact(message,'⬇️');

		if (messageUpvote >= messageDownvote &&	message.attachments.size > 0 && messageDate.getDate() == limitDate.getDate() && messageDate.getMonth() == limitDate.getMonth()) {
			await channelOutput.send('**'+message.content+'** \n> by <@' + message.author + '>', {files: [message.attachments.first().url]})
			.then(async message => {
				try {
					await message.react('⬆️');
					await message.react('⬇️');
				} catch (error) {
					console.error(error);
				}
			});
		}
	}
	await channelOutput.send('<@&'+settings.C32CouncilID+'> There are new textures to vote for!');
}

// Texture submission process: fetch messages from channel, avoid 50 limitation of message.fetch()
async function getMessages(channelID, limit = 500) {
	const sum_messages = [];
	let last_id;
	let channel = client.channels.cache.get(channelID);

	while (true) {
		const options = { limit: 100 };
		if (last_id) options.before = last_id;

		const messages = await channel.messages.fetch(options);
		sum_messages.push(...messages.array());
		last_id = messages.last().id;

		if (messages.size != 100 || sum_messages >= limit) break;
	}
	return sum_messages;
}

// Tell how many people reacted with an emoji
function countReact (message, emoji) {
	var reaction = message.reactions.cache.get(emoji);

	if (reaction != undefined) return reaction.count - 1; // remove bot vote
	else return 0
}

// True if this url is a png image
function attachIsImage(msgAttach) {
	var url = msgAttach.url;
	return url.indexOf('png', url.length - 'png'.length /*or 3*/) !== -1;
}

// Login the bot
client.login(process.env.CLIENT_TOKEN).catch(console.error);