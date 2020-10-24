const Discord = require('discord.js');

module.exports = {
	name: 'website',
  aliases: ['site'],
	description: 'Displays the website of the discord',
	execute(message, args) {
    //Faithful Dungeons
    if (message.guild.id === '714910830272970834') {
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Dungeons Website:')
        .setDescription('https://faithful-dungeons.github.io/Website/')
        .setThumbnail('https://i.imgur.com/ldI5hDM.png')
	  		.setColor('#E1631F')
	  		.setFooter('Faithful Dungeons', 'https://i.imgur.com/ldI5hDM.png');
      message.channel.send(embed);
      //Faithful Mods
    } else if (message.guild.id === '748264625962877019') { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Mods Website:')
        .setDescription('https://faithful-mods.github.io/')
        .setThumbnail('https://i.imgur.com/scpOogK.png')
	  		.setColor('#915E00')
	  		.setFooter('Faithful Mods', 'https://i.imgur.com/scpOogK.png');
      message.channel.send(embed);
      //Faithful Tweaks
    } else if (message.guild.id === '720966967325884426') { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Tweaks Website:')
        .setDescription('https://faithfultweaks.com/')
        .setThumbnail('https://i.imgur.com/4U1ZSYT.png')
	  		.setColor('#C4905A')
	  		.setFooter('Faithful Tweaks', 'https://i.imgur.com/4U1ZSYT.png');
      message.channel.send(embed);
      //Faithful Addons
    } else if (message.guild.id === '614160586032414845') { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Addons Website:')
        .setDescription('https://faithful.team/tag/faithful-addons/')
        .setThumbnail('https://i.imgur.com/OSpMYU6.png')
	  		.setColor('#47E9D6')
	  		.setFooter('Faithful Addons', 'https://i.imgur.com/OSpMYU6.png');
      message.channel.send(embed);
      //Faithful Traditional
    } else if (message.guild.id === '766856721712545824') { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Traditional page:')
        .setDescription('https://www.planetminecraft.com/texture-pack/faithful-traditional-64x/')
        .setThumbnail('https://i.imgur.com/SLpji2x.png')
	  		.setColor('#FFD800')
	  		.setFooter('Faithful Traditional', 'https://i.imgur.com/SLpji2x.png');
      message.channel.send(embed);
      //Other servers
    } else { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Faithful Website:')
        .setDescription('https://faithful.team/')
        .setThumbnail('https://i.imgur.com/W1pfHe0.png')
	  		.setColor('#FFBB00')
	  		.setFooter('Faithful Team', 'https://i.imgur.com/W1pfHe0.png');
      message.channel.send(embed);
    }
	}
};