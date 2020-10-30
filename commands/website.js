const Discord  = require('discord.js');
const settings = require('../settings.js');

module.exports = {
	name: 'website',
  aliases: ['site'],
	description: 'Displays the website of the discord',
	execute(message, args) {
    //Faithful Dungeons
    if (message.guild.id === settings.FDungeonsID) {
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Dungeons Website:')
        .setDescription('https://faithful-dungeons.github.io/Website/')
        .setThumbnail(settings.FDungeonsIMG)
	  		.setColor(settings.FDungeonsColor)
	  		.setFooter('Faithful Dungeons', settings.FDungeonsIMG);
      message.channel.send(embed);
      //Faithful Mods
    } else if (message.guild.id === settings.FModsID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Mods Website:')
        .setDescription('https://faithful-mods.github.io/')
        .setThumbnail(settings.FModsIMG)
	  		.setColor(settings.FModsColor)
	  		.setFooter('Faithful Mods', settings.FModsIMG);
      message.channel.send(embed);
      //Faithful Tweaks
    } else if (message.guild.id === settings.FTweaksID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Tweaks Website:')
        .setDescription('https://faithfultweaks.com/')
        .setThumbnail(settings.FTweaksIMG)
	  		.setColor(settings.FTweaksColor)
	  		.setFooter('Faithful Tweaks', settings.FTweaksIMG);
      message.channel.send(embed);
      //Faithful Addons
    } else if (message.guild.id === settings.FAddonsID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Addons Website:')
        .setDescription('https://faithful.team/tag/faithful-addons/')
        .setThumbnail(settings.FAddonsIMG)
	  		.setColor(settings.FAddonsColor)
	  		.setFooter('Faithful Addons', settings.FAddonsIMG);
      message.channel.send(embed);
      //Faithful Traditional
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
	  		.setTitle('Faithful Website:')
        .setDescription('https://faithful.team/')
        .setThumbnail(settings.FTeamIMG)
	  		.setColor(settings.FTeamColor)
	  		.setFooter('Faithful Team', settings.FTeamIMG);
      message.channel.send(embed);
    }
	}
};