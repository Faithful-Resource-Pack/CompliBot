// Libs:
require('dotenv').config(); 
const Discord = require("discord.js");
const client = new Discord.Client();

// Secrets:
prefix = process.env.PREFIX;
token = process.env.CLIENT_TOKEN;

// Channels ids defitions:
const IDsubmitR  = '747889024068485180'; // -> #submit-textures (Robert's testing discord)
const IDsubmitFD = '715236892945285181'; // -> #submit-textures (Faithful Dungeons discord)

// Bot status:
client.on("ready", () => {
	client.user.setActivity("https://faithful-dungeons.github.io/Website/", {type: "PLAYING"});
	console.log("JavaScript is pain, but i'm fine, i hope...");
});

//True if this url is a png image.
function attachIsImage(msgAttach) {
    var url = msgAttach.url;
    return url.indexOf("png", url.length - "png".length /*or 3*/) !== -1;
}

// Run:
client.on("message", message => {
  // Bot messages aren't read:
  if (message.author.bot) return;
  
  /**********************************
          COMMANDS WITH PREFIX 
   **********************************/

  // Ping command:
  if (message.content === prefix + 'ping') {
    console.log('ping triggered');

    message.channel.send('Pinging...').then(m => {
      var ping = m.createdTimestamp - message.createdTimestamp;

      var embed = new Discord.MessageEmbed()
        .setAuthor(message.member.user.tag)
        .setTitle('Your ping is:')
        .setDescription('**' + ping + 'ms**')
        .setColor('#3aafa3')

      m.edit(embed);
    });
  }

  // Clean command:
  if (message.content.startsWith( prefix + 'clear') ){
    if (message.member.roles.find(r => r.name === "God")) {
      console.log('clear triggered');

      var args   = message.content.split(' ').slice(1); // cut after '/clear'
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
      message.reply("You don't have the permission to do that!").then(msg => {
          msg.delete({timeout: 30000});
        });
    }
  }

  // HELP SETTINGS:
  // Help:
  if (message.content === prefix + 'help') {
    console.log('help triggered');

    var embed = new Discord.MessageEmbed()
      .setAuthor(message.member.user.tag)
      .setTitle('Help Menu:')
      .setColor('#d4a011')
      .addFields(
        { name: '`/help`', value: 'open this menu', inline: true },
        { name: '`/ping`', value: 'return user ping', inline: true },
        { name: '`/help submission`', value: 'get infos about textures submission', inline: true }
      );

    message.channel.send(embed);
  }
  // Help submission:
  if (message.content === prefix + 'help submission') {
    console.log('help submission triggered');

    var embed = new Discord.MessageEmbed()
      .setAuthor(message.member.user.tag)
      .setTitle('Textures Submissions help')
      .setColor('#d4a011')
      .addFields(
        { name: 'How submit a texture for review?', value: 'Go to #submit-textures channel, send a message with the texture you made.', inline: true },
        { name: 'Message Requirements:', value: 'Texture need to be a .png file, you also have to add the texture name & path (ex: texture `(path/file/file/texture.png)`', inline: true}
      );

    message.channel.send(embed);
  }

  // Special commands: (easter eggs)
  if (message.content === prefix + 'behave') {
    message.channel.send("I'm so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)");
  }
  if (message.content === '(╯°□°）╯︵ ┻━┻') {
    message.channel.send('┬─┬ ノ( ゜-゜ノ)');
  }

  /**********************************
         COMMANDS WITHOUT PREFIX 
   **********************************/

  // TEXTURES SUBMISSIONS:
  if (message.channel.id === (IDsubmitFD || IDsubmitR)) {
    if (message.attachments.size > 0) {
        if (message.attachments.every(attachIsImage)){

        if(!message.content.includes('(')) {
          message.reply("You need to add the texture path to your texture submission, following this example: **texture** `(**file1**/**file2**/**texture.png**)`").then(msg => {
            msg.delete({timeout: 30000});
          });
        } else try {
          message.react('✅').then(() => {message.react('❌')});
        } catch (error) {
          console.error("ERROR | One of the emojis failed to react!");
        }

      } else {
        message.reply("Your texture submission needs to have an image file!").then(msg => {
          msg.delete({timeout: 30000});
        });
      }
    } else {
      message.reply("You need to attach a png file!").then(msg => {
        msg.delete({timeout: 30000});
      });
    }
  }

  // Check texture feature
  // All channel without #submit-texture
  if (message.channel.id !== '747889024068485180' ) {
    if(message.content.includes('#4393' )) {
      const exampleEmbed = new Discord.MessageEmbed()
        .setAuthor(message.member.user.tag)
        .setColor('#dd7735')
        .setTitle('dirt_highblockhalls.png')
        .setURL('https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png')
        .setDescription('block texture')
        .setThumbnail('https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png')
        .addFields(
          { name: 'Author:', value: 'Some guy', inline: true },
          { name: 'Resolution:', value: '32 x 32', inline: true }
      )
      .setFooter('Faithful Dungeons', 'https://i.imgur.com/ldI5hDM.png');
      message.channel.send(exampleEmbed);
    }
  }
});

client.login(token);
