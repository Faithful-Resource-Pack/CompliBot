require('dotenv').config(); 
const Discord = require("discord.js");
const client = new Discord.Client();

prefix = process.env.PREFIX;
token = process.env.CLIENT_TOKEN;

client.on("ready", () => {
	client.user.setActivity("https://faithful-dungeons.github.io/Website/", {type: "PLAYING"});
	console.log("I am turned on lmao");
});

function attachIsImage(msgAttach) {
    var url = msgAttach.url;
    //True if this url is a png image.
    return url.indexOf("png", url.length - "png".length /*or 3*/) !== -1;
}

client.on("message", message => {
  // Bot messages aren't read:
  if (message.author.bot) return;
  
  // COMMANDS WITH PREFIX
  if (message.content.startsWith( prefix + ' ping' )) {
    message.channel.send('Pong!');
  }
  if (message.content.startsWith( prefix + ' help' )) {
    message.channel.send('JavaScript is ~~Awesome~~');
  }
  if (message.content.startsWith( prefix + ' behave' )) {
    message.channel.send("I'm so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)")
  }

  // COMMANDS WITHOUT PREFIX:
  // Submit texture feature:
  // id: 747889024068485180 -> #submit-textures (Robert's testing discord)
  // id: 715236892945285181 -> #submit-textures (Faithful Dungeons discord)
  if (message.channel.id === '715236892945285181' || message.channel.id === '715236892945285181') {
    // if message have a file attached:
    if (message.attachments.size > 0) {
      // run function to test url to see if file is an img
        if (message.attachments.every(attachIsImage)){

        // If message doesn't have the texture path:
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
        .setColor('#dd7735')
        .setTitle('dirt_highblockhalls.png')
        .setURL('https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png')
        .setDescription('block texture')
        .setThumbnail('https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png')
        .addFields(
          { name: 'Author:', value: 'Some guy', inline: true },
          { name: 'Resolution:', value: '32 x 32', inline: true },
      )
      .setFooter('Faithful Dungeons', 'https://i.imgur.com/ldI5hDM.png');
      message.channel.send(exampleEmbed);
    }
  }
});

client.login(token);