const Discord  = require('discord.js');
const settings = require('../settings.js');

module.exports = {
	name: 'website',
  aliases: ['site'],
	description: 'Displays the website of the discord',
	execute(message, args) {
    //Compliance Dungeons
    if (message.guild.id === settings.CDungeonsID) {
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Dungeons website:')
        .setDescription('https://faithful-dungeons.github.io/Website/')
        .setThumbnail(settings.CDungeonsIMG)
	  		.setColor(settings.CDungeonsColor)
	  		.setFooter('Compliance Dungeons', settings.CDungeonsIMG);
      message.channel.send(embed);
      //Compliance Mods
    } else if (message.guild.id === settings.CModsID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Mods website:')
        .setDescription('https://faithful-mods.github.io/')
        .setThumbnail(settings.CModsIMG)
	  		.setColor(settings.CModsColor)
	  		.setFooter('Compliance Mods', settings.CModsIMG);
      message.channel.send(embed);
      //Compliance Tweaks
    } else if (message.guild.id === settings.CTweaksID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Tweaks website:')
        .setDescription('https://faithfultweaks.com/')
        .setThumbnail(settings.CTweaksIMG)
	  		.setColor(settings.CTweaksColor)
	  		.setFooter('Compliance Tweaks', settings.CTweaksIMG);
      message.channel.send(embed);
      //Compliance Addons
    } else if (message.guild.id === settings.CAddonsID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Addons website:')
        .setDescription('Currently not done')
        .setThumbnail(settings.CAddonsIMG)
	  		.setColor(settings.CAddonsColor)
	  		.setFooter('Compliance Addons', settings.CAddonsIMG);
      message.channel.send(embed);
      //Compliance Traditional
    } else if (message.guild.id === settings.FTraditionalID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Traditional page:')
        .setDescription('https://www.planetminecraft.com/texture-pack/faithful-traditional-64x/')
        .setThumbnail(settings.FTraditionalIMG)
	  		.setColor(settings.FTraditionalColor)
	  		.setFooter('Faithful Traditional', settings.FTraditionalIMG);
      message.channel.send(embed);
      //Other servers
    } else { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance 32x website:')
        .setDescription('https://compliance-resource-pack.github.io/Website/')
        .setThumbnail(settings.C32IMG)
	  		.setColor(settings.C32Color)
	  		.setFooter('Compliance 32x', settings.C32IMG);
      message.channel.send(embed);
    }
	}
};