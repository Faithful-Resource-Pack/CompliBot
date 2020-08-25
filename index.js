require('dotenv').config(); 
const Discord = require("discord.js");
const client = new Discord.Client();

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
  // Prefix required to execute command:
  if (message.content.indexOf(process.env.PREFIX) !== 0) return;

  // This is the usual argument parsing we love to use.
  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // COMMANDS WITH PREFIX:
  // if there is the prefix at the begining of the message
  if (message.content.indexOf(process.env.PREFIX) === 1){
    if (command === 'ping') {
      message.channel.send('Pong!');
    }
  } 
  // COMMANDS WITHOUT PREFIX:
  else {
    // Submit texture feature:
    // id: 747889024068485180 -> #submit-texture (Robert testing discord)
    if (message.channel.id === '747889024068485180') {
      // if message have a file attached:
      if (message.attachments.size > 0) {
        // run function to test url to see if file is an img
        if (message.attachments.every(attachIsImage)){

          // If message doesn't have the texture path:
          if(!message.content.includes('(')) {
            message.reply("You need to add the texture path to your texture submission, following this example: texture (file1/file2/texture.png)").then(msg => {
              msg.delete({timeout: 3000});
            });
          } else try {
            message.react('✅').then(() => {message.react('❌')});
          } catch (error) {
            console.error("ERROR | One of the emojis failed to react!");
          }

        } else {
          message.reply("Your texture submission needs to have an image file!").then(msg => {
            msg.delete({timeout: 3000});
          });
        }
      } else {
        message.reply("You need to attach a png file!").then(msg => {
          msg.delete({timeout: 3000});
        });
      }
    }
  } 
});


client.on('message', message => {
	if (message.channel.id === '720677267977535592') /*The #general channel id on the testing discord*/ {
		if(!message.content.includes("#4693")) {
			message.channel.send({embed: {
				color: DD7735,
				title: "dirt_highblockhalls.png",
				url: "https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png",
				thumbnail: "https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png",
				fields: [{
					name: "Author:",
					value: "Some guy"
				  },
				  {
					name: "Resolution:",
					value: "32 x 32"
				  }
				]
			}});
		}
	}
});

//client.on("message", message => {
//	if (message.channel.id === "720677267977535592") {
//		if(!message.content.startsWith("@Faithful Dungeons#0623 behave")) {
//			message.reply("I'm so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)")
//		}
//	}
//});

client.login(process.env.CLIENT_TOKEN);
