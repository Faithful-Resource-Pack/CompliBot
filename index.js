// Libs:
require('dotenv').config();
const Discord        = require('discord.js');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const express        = require('express');
const fs             = require('fs');
const app            = express();
const port           = 3000;
const client         = new Discord.Client();
client.commands      = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const settings = require('./settings.js');

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

// Secrets:
prefix = process.env.PREFIX;
token  = process.env.CLIENT_TOKEN;
maintenance  = process.env.MAINTENANCE;

// Bot status:
client.on('ready', () => {
  if (maintenance === 'true') {
    client.user.setPresence({ activity: { name: 'maintenance mode (I may work, but not completely)' }, status: 'dnd' });
  } else {
    client.user.setActivity('https://faithful.team/', {type: 'PLAYING'});
  }
	console.log('JavaScript is pain, but i\'m fine, i hope...');
  let fTweaksGuild = client.guilds.cache.get('720966967325884426');
  fTweaksGuild.channels.cache.get('750638888296382504').setName('Member Count: ' + fTweaksGuild.memberCount)
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

client.on('message', message => {
  // Bot messages aren't read
  if (message.content.startsWith(prefix) || message.author.bot) return;

  // Clean command:
  /*if (message.content.startsWith( prefix + 'clear') ){
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

  // Special commands: (easter eggs)
  if (command === 'behave') {
    message.channel.send("I'm so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)");
  }*/
  if (message.content.includes('(╯°□°）╯︵ ┻━┻')) {
    message.reply('┬─┬ ノ( ゜-゜ノ) Take a coffee and calm down');
  }

  // Texture submission:
  if (message.channel.id === settings.FDungeonsSubmit) {
    if (message.attachments.size > 0) {
        if (message.attachments.every(attachIsImage)){

        if(!message.content.includes('(')) {
          message.reply('you need to add the texture path to your texture submission, follow this example: `**texture name** (Content/**folder1**/**folder2**/**texture name.png**)`').then(msg => {
            msg.delete({timeout: 30000});
            message.react('❌');
          });
        } else try {
          message.react('✅').then(() => {message.react('❌')});
        } catch (error) {
          console.error('ERROR | One of the emojis failed to react!');
        }

      } else {
        message.reply('you need to attach a png file!').then(msg => {
          msg.delete({timeout: 30000});
          message.react('❌');
        });
      }
    } else {
      message.reply('your texture submission needs to have an image attached!').then(msg => {
        msg.delete({timeout: 30000});
        message.react('❌');
      });
    }
  }
  // Texture submission Faithful Traditional:
  if (message.channel.id === settings.FTraditionalSubmit) {
    if (message.attachments.size > 0) {
      try {
        message.react('✅').then(() => {message.react('❌')});
      } catch (error) {
        console.error('ERROR | One of the emojis failed to react!');
      }
    } else if(!message.member.roles.cache.some(r=>['Pack Managers', 'Server Managers'].includes(r.name)) ) {
      message.reply('your texture submission needs to have an image attached!').then(msg => {
        msg.delete({timeout: 30000});
        message.react('❌');
      });
    }
  }

});

client.login(token);
