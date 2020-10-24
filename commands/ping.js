const Discord = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Pong!',
	execute(message, args) {
    //Faithful Dungeons
    if (message.guild.id === '714910830272970834') {
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor('#E1631F')
          .setFooter('Faithful Dungeons', 'https://i.imgur.com/ldI5hDM.png');

        m.edit(embed);
      });
      //Faithful Mods
    } else if (message.guild.id === '748264625962877019') { 
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor('#915E00')
          .setFooter('Faithful Mods', 'https://i.imgur.com/scpOogK.png');

        m.edit(embed);
      });
      //Faithful Tweaks
    } else if (message.guild.id === '720966967325884426') { 
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor('#C4905A')
          .setFooter('Faithful Tweaks', 'https://i.imgur.com/4U1ZSYT.png');

        m.edit(embed);
      });
      //Faithful Addons
    } else if (message.guild.id === '614160586032414845') { 
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor('#47E9D6')
          .setFooter('Faithful Addons', 'https://i.imgur.com/OSpMYU6.png');

        m.edit(embed);
      });
      //Faithful Traditional
    } else if (message.guild.id === '766856721712545824') { 
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor('#FFD800')
          .setFooter('Faithful Traditional', 'https://i.imgur.com/SLpji2x.png');

        m.edit(embed);
      });
      //Other servers
    } else { 
		  message.channel.send('Pinging...').then(m => {
        var ping = m.createdTimestamp - message.createdTimestamp;

        var embed = new Discord.MessageEmbed()
          .setTitle('Your ping is:')
          .setDescription('**' + ping + 'ms**')
          .setColor('#FFBB00')
          .setFooter('Faithful Team', 'https://i.imgur.com/W1pfHe0.png');

        m.edit(embed);
      });
    }
	}
};