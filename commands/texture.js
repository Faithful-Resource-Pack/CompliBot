const Discord  = require('discord.js');
const axios    = require('axios').default;
var https      = require('https');
var sizeOf     = require('image-size');
const speech   = require('../messages');
const settings = require('../settings.js');

//Return Image size, need url.
function getMeta(imgUrl) {
	return new Promise(function(resolve, reject) {

		https.get(imgUrl, function (response) {
			var chunks = [];
			response.on('data', function (chunk) {
				chunks.push(chunk);
			}).on('end', function() {
				var buffer = Buffer.concat(chunks);
				resolve(sizeOf(buffer));
			});
		}).on('error', function(error) {
			reject(error);
		});

	});
}

module.exports = {
	name: 'texture',
	description: 'Displays a specified texture from Compliance Dungeons',
	execute(message, args) {
    if (message.guild.id !== settings.CDungeonsID) return message.reply('this command can only be used in the Compliance Dungeons server!').then(msg => {
          msg.delete({timeout: 30000});
          message.react('❌');
        });
    else {
      //console.trace('get texture triggered');

		  var argss  = message.content.split(' ').slice(1); // cut after command
		  var texture = args.join();

		  var imgURL = 'https://raw.githubusercontent.com/Faithful-Dungeons/Resource-Pack/master/Block%20Textures/' + texture + '.png';
		  console.log(imgURL);

		  axios.get(imgURL).then(function (response) {
			  //console.log('well played');
			  getMeta(imgURL).then(function (dimension) {
			  	var size = dimension.width + 'x' + dimension.height;

				  var embed = new Discord.MessageEmbed()
				  .setTitle(texture)
				  .setColor(settings.CDungeonsColor)
				  .setURL(imgURL)
				  .setDescription('block texture')
				  .setThumbnail(imgURL)
			  	.addFields(
				  	{ name: 'Author:', value: 'WIP', inline: true },
				  	{ name: 'Resolution:', value: size, inline: true }
				  )
				  .setFooter('Compliance Dungeons', settings.CDungeonsIMG);

				  message.channel.send(embed);
			  }).catch(function(error) {
				  console.log(error);
			  });
		  }).catch(function(error) {
			  console.log(error);
        message.react('❌');
			  message.reply(speech.BOT_TEXTURE_DOESNT_EXIST).then(msg => {
          msg.delete({timeout: 30000});
        });
		  });
    }
  }
};