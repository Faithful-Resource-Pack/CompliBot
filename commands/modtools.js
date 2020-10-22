const Discord     = require("discord.js");
const EMBED_COLOR = '#E1631F';
const BotImgURL   = 'https://i.imgur.com/ldI5hDM.png';

module.exports = {
	name: 'modtools',
	description: 'Displays tools for Dungeons modding',
	execute(message, args) {
    if (message.guild.id !== '714910830272970834') return message.reply('This command can only be used in the Faithful Dungeons server!').then(msg => {
          msg.delete({timeout: 30000});
          message.react('❌');
        });
    else {
    //console.trace('modding tools triggered');

     const embed = new Discord.MessageEmbed()
	  		.setTitle('Tools for making Dungeons mods:')
	  		.setColor(EMBED_COLOR)
	  		.setThumbnail(BotImgURL)
	  		.addFields(
				  { name: 'Dungeons mod kit by CCCode:', value: 'https://github.com/Dokucraft/Dungeons-Mod-Kit', inline: true },
				  { name: 'Loading icon creator:', value: 'https://github.com/Faithful-Dungeons/Resource-Pack/tree/master/Tools/loader', inline: true },
          { name: 'Alpha image converter:', value: 'https://github.com/Faithful-Dungeons/Resource-Pack/tree/master/Tools/alpha_img', inline: true },
		  	)
	  		.setFooter('Faithful Dungeons', BotImgURL);

     message.channel.send(embed);
    }
  }
};