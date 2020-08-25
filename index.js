// This line MUST be first, for discord.js to read the process envs!
require('dotenv').config(); 
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log("I am ready!");
});

client.on("message", message => {
  if (message.author.bot) return;
  // The process.env.PREFIX is your bot's prefix in this case.
  if (message.content.indexOf(process.env.PREFIX) !== 0) return;

  // This is the usual argument parsing we love to use.
  const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // And our 2 real basic commands!
  if(command === 'ping') {
    message.channel.send('Pong!');
  } else
  if (command === 'blah') {
    message.channel.send('Meh.');
  }
});

// There's zero need to put something here. Discord.js uses process.env.CLIENT_TOKEN if it's available,
// and this is what is being used here. If on discord.js v12, it's DISCORD_TOKEN
client.login(process.env.CLIENT_TOKEN);


/*
const Discord = require("discord.js");
const client  = new Discord.Client();

// Start bot process:
client.once("ready", () =>{
	client.user.setActivity("https://faithful-dungeons.github.io/Website/", {type: "PLAYING"});
	console.log("I am turned on lmao");
});

// code:
client.on('message', async message => {
	if (message.channel.id === "715236892945285181") {
		if (message.attachments.size > 0) {
			if(!message.content.includes("(")) {
				message.reply("your texture submission doesn't contain a file path! Please specify the file path like this: `*texture name* ()`")
					.then(msg => {
						msg.delete({ timeout: 30000 })
					})
			}
    	    else try {
    	    	await message.react('✅');
    	    	await message.react('❌');
    	    } catch (error) {
    	    	console.error("ERROR | One of the emojis failed to react!");
    	    }
		}
//		else if(!message.sender === "720680190640128010") {
//			message.reply("this channel is only for textures. If you want to talk about about a submitted texture, then go to #texture-discussion")
//				.then(msg => {
//					msg.delete({ timeout: 30000 })
//				})
//	    }
	}
});

//client.on('message', message => {
//	if (message.channel.id === '720677267977535592') {
//		if(!message.content.includes("#4693")) {
//			const TextureEmbed = new Discord.MessageEmbed()
//				.setColor('#DD7735')
//				.setTitle('dirt_highblockhalls.png')
//				.setURL('https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png')
//				.setThumbnail('https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png')
//				.addFields(
//					{ name: 'Author:', value: 'Some guy', inline: true },
//					{ name: 'Resolution:', value: '32 x 32', inline: true },
//				);
//
//			message.channel.send(TextureEmbed);
//		}
//	}
//});
//https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/dirt_highblockhalls.png

//client.on("message", message => {
//	if (message.channel.id === "720677267977535592") {
//		if(!message.content.startsWith("@Faithful Dungeons#0623 behave")) {
//			message.reply("I'm so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)")
//		}
//	}
//});

// token is available in configs vars in heroku settings

*/
