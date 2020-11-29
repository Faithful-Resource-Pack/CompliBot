// Libs:
require('dotenv').config();
const Discord        = require('discord.js');
const express        = require('express');
const fs             = require('fs');
const cron           = require('cron');
const app            = express();
const port           = 3000;
const client         = new Discord.Client();
client.commands      = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const settings     = require('./settings.js');

app.get('/', (req, res) => res.send('Hey, this is a Discord bot, not a website!'));
app.listen(port, () => console.log(`listening at http://localhost:${port}`));

// Secrets:
prefix = process.env.PREFIX;

// Bot status:
client.on('ready', () => {
  if (process.env.MAINTENANCE === 'true') {
    client.user.setPresence({ activity: { name: 'maintenance' }, status: 'dnd' });
  } else {
    client.user.setActivity('compliancepack.net', {type: 'PLAYING'});
  }
	console.log('JavaScript is a pain, but i\'m fine, i hope...');

	// scheduledFunctions.start();

  let fTweaksGuild = client.guilds.cache.get('720966967325884426');
  fTweaksGuild.channels.cache.get('750638888296382504').setName('Member Count: ' + fTweaksGuild.memberCount)
});

// Texture submission process:
let scheduledFunctions = new cron.CronJob('00 * * * * *', () => {
	// this runs every day at 00:00:00
	let channel = client.channels.cache.get('779759327665848320');

	const DAYS_OFF = 0;

	// return all messages from the channel
	channel.messages.fetch().then(async messagesMap => {
    console.log(`${messagesMap.size} messages.`);

		let messages = Array.from(messagesMap.keys());	
		for (var i in messages) {
			let message   = channel.messages.cache.get(messages[i]);
			let content   = message.content;
			let timestamp = message.createdTimestamp;

			var messageDate = new Date( timestamp );
			var limitDate = new Date();
 			limitDate.setDate(limitDate.getDate()-DAYS_OFF);

			if (messageDate.getDate() == limitDate.getDate() && messageDate.getMonth() == limitDate.getMonth()) {
				console.log(content, messageDate);
			}
			
		}

	});
});

//True if this url is a png image
function attachIsImage(msgAttach) {
  var url = msgAttach.url;
  return url.indexOf('png', url.length - 'png'.length /*or 3*/) !== -1;
}

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Member counter
client.on('guildMemberAdd', member =>{
  let fTweaksGuild = client.guilds.cache.get('720966967325884426');
  fTweaksGuild.channels.cache.get('750638888296382504').setName('Member Count: ' + fTweaksGuild.memberCount);
});

client.on('guildMemberRemove', member =>{
  let fTweaksGuild = client.guilds.cache.get('720966967325884426');
  fTweaksGuild.channels.cache.get('750638888296382504').setName('Member Count: ' + fTweaksGuild.memberCount);
});

// Command handler
client.on('message', message => {
  // Bot messages aren't read
  if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

  if (message.channel.type === 'dm') {
  	return message.reply('My creators don\'t allow me to execute commands inside DMs, sorry!');
  }

  try {
	  command.execute(message, args);
  } catch (error) {
	  console.error(error);
	  message.reply('there was an error trying to execute that command!');
  }
});

client.on('message', async message => {
  // Bot messages aren't read
  if (message.content.startsWith(prefix) || message.author.bot) return;

  if (message.content.includes('(╯°□°）╯︵ ┻━┻')) {
    await message.reply('┬─┬ ノ( ゜-゜ノ) calm down bro');
  }
  else if (message.content.toLowerCase() === 'mhhh') {
    const embed = new Discord.MessageEmbed()
	    .setColor(settings.C32Color)
	    .setTitle('Uh-oh moment')
	    .setFooter('Swahili -> English', settings.C32IMG);
    await message.channel.send(embed);
  }
  else if (message.content === 'F' ) {
    await message.react('🇫');
  }
  else if (message.content.toLowerCase() === 'band') {
    await message.react('🎤');
    await message.react('🎸');
    await message.react('🥁');
    await message.react('🎺');
    await message.react('🎹');
  }
	else if (message.content.toLowerCase() === 'hello there') {
		var luck = Math.floor(Math.random() * Math.floor(5)); // random number between 0 and 4
		if (luck != 1) await message.channel.send('https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif');
		else await message.channel.send('https://preview.redd.it/6n6zu25c66211.png?width=960&crop=smart&auto=webp&s=62024911a6d6dd85f83a2eb305df6082f118c8d1');
	}

  // Texture submission Compliance 32x:
  else if (message.channel.id === settings.C32Submit1) {
    if (message.attachments.size > 0) {
      try {
        await message.react('⬆️');
        await message.react('⬇️');
      } catch (error) {
        console.error('ERROR | One of the emojis failed to react!' + error);
      }
    } else if(!message.member.roles.cache.has('773984348860711003')) {
      await message.reply('your texture submission needs to have an file attached!').then(async msg => {
        await message.react('❌');
        await msg.delete({timeout: 30000});
      });
    }
  }
  // Texture submission Compliance 32x 2:
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

  // Texture submission:
  else if (message.channel.id === settings.CDungeonsSubmit) {
    if (message.attachments.size > 0) {
      if (message.attachments.every(attachIsImage)){

        if(!message.content.includes('(')) {
          await message.reply('you need to add the texture path to your texture submission, follow this example: `**texture name** (Content/**folder1**/**folder2**/**texture name.png**)`').then(async msg => {
            await message.react('❌');
            await msg.delete({timeout: 30000});
          });
        } else try {
          await message.react('✅');
          await message.react('❌');
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

// old stuff that needs to be added

/*client.on('message', message => {
  // Bot messages aren't read
  if (message.content.startsWith(prefix) || message.author.bot) return;

  // Clean command:
  if (message.content.startsWith( prefix + 'clear') ){
    if(message.member.roles.cache.some(r=>["God", "Helper", "Mod", "Server Creator"].includes(r.name)) ) {
      //console.trace('clear triggered');

      var argss   = message.content.split(' ').slice(1); // cut after '/clear'
      var amount = args.join(' ');

      if (!amount) return message.reply("You haven't given an amount of messages which should be deleted!");
      if (isNaN(amount)) return message.reply("The amount parameter isn't a number!");

      if (amount > 100) return message.reply("You can't delete more than 100 messages at once!");
      if (amount < 1) return message.reply("You have to delete at least 1 message :upside-down:");

      try {
        message.channel.messages.fetch({ limit: amount }).then(messages => {
          message.channel.bulkDelete(messages)
        });
      } catch(error) { // doesn't seems to work
        console.error(error);
        message.reply("The amount contains messages older than 14 days, can't delete them").then(msg => {
          msg.delete({timeout: 30000});
        });
      }
    } else {
      message.reply("speech.BOT_NO_PERMISSION").then(msg => {
          msg.delete({timeout: 30000});
        });
    }
  }

  // HELP SETTINGS:
  // Help:
  if (message.content === prefix + 'help') {
    //console.trace('help triggered');

    var embed = new Discord.MessageEmbed()
      .setTitle('Help Menu:')
      .setColor(EMBED_COLOR)
      .addFields(
        { name: '`/help`', value: 'open this menu', inline: true },
        { name: '`/ping`', value: 'return user ping', inline: true },
        { name: '`/help submission`', value: 'get infos about textures submission', inline: true }
      )
      .setFooter('Faithful Dungeons', BotImgURL);

    message.channel.send(embed);
  }
  // Help submission:
  if (message.content === prefix + 'help submission') {
    //console.trace('help submission triggered');

    var embed = new Discord.MessageEmbed()
      .setTitle('Textures Submissions help')
      .setColor(EMBED_COLOR)
      .addFields(
        { name: 'How submit a texture for review?', value: 'Go to #submit-textures channel, send a message with the texture you made.', inline: false },
        { name: 'Message Requirements:', value: 'Texture need to be a .png file, you also have to add the texture name & path (ex: texture `(path/file/file/texture.png)`', inline: false}
      )
      .setFooter('Faithful Dungeons', BotImgURL);

    message.channel.send(embed);
  }

});*/

client.login(process.env.CLIENT_TOKEN);
