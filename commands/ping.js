const Discord  = require('discord.js');
const settings = require('../settings.js');

module.exports = {
	name: 'ping',
	description: 'Pong!',
	execute(message, args) {
    //Faithful Dungeons
    if (message.guild.id === settings.FDungeonsID) {
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor(settings.FDungeonsColor)
          .setFooter('Faithful Dungeons', settings.FDungeonsIMG);

        m.edit(embed);
      });
      //Faithful Mods
    } else if (message.guild.id === settings.FModsID) { 
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor(settings.FModsColor)
          .setFooter('Faithful Mods', settings.FModsIMG);

        m.edit(embed);
      });
      //Faithful Tweaks
    } else if (message.guild.id === settings.FTweaksID) { 
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor(settings.FTweaksColor)
          .setFooter('Faithful Tweaks', settings.FTweaksIMG);

        m.edit(embed);
      });
      //Faithful Addons
    } else if (message.guild.id === settings.FAddonsID) { 
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor(settings.FAddonsColor)
          .setFooter('Faithful Addons', settings.FAddonsIMG);

        m.edit(embed);
      });
      //Faithful Traditional
    } else if (message.guild.id === settings.FTraditionalID) { 
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor(settings.FTraditionalColor)
          .setFooter('Faithful Traditional', settings.FTraditionalIMG);

        m.edit(embed);
      });
      //Other servers
    } else { 
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor(settings.FTeamColor)
          .setFooter('Faithful Team', settings.FTeamIMG);

        m.edit(embed);
      });
    }
	}
};