const Discord  = require('discord.js');
const settings = require('../settings.js');

module.exports = {
	name: 'website',
  aliases: ['site'],
	description: 'Displays the website of the discord',
	execute(message, args) {
    if (!args.length) {
    //Compliance Dungeons
    if (message.guild.id === settings.CDungeonsID) {
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Dungeons sites:')
        .addFields(
				  { name: 'Website:', value: 'https://compliancepack.net/#compliance-dungeons'},
				  { name: 'CurseForge:', value: 'none'},
          { name: 'Planet Minecraft:', value: 'https://www.planetminecraft.com/member/faithful_dungeons/'},
		  	)
        .setThumbnail(settings.CDungeonsIMG)
	  		.setColor(settings.CDungeonsColor)
	  		.setFooter('Compliance Dungeons', settings.CDungeonsIMG);
      message.channel.send(embed);
      //Compliance Mods
    } else if (message.guild.id === settings.CModsID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Mods sites:')
        .addFields(
				  { name: 'Website:', value: 'https://compliancepack.net/mods'},
				  { name: 'CurseForge:', value: 'none'},
          { name: 'Planet Minecraft:', value: 'https://www.planetminecraft.com/member/faithful_mods/'},
		  	)
        .setThumbnail(settings.CModsIMG)
	  		.setColor(settings.CModsColor)
	  		.setFooter('Compliance Mods', settings.CModsIMG);
      message.channel.send(embed);
      //Compliance Tweaks
    } else if (message.guild.id === settings.CTweaksID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Tweaks sites:')
        .addFields(
				  { name: 'Website:', value: 'https://faithfultweaks.com/'},
				  { name: 'CurseForge:', value: 'none'},
          { name: 'Planet Minecraft:', value: 'none'},
		  	)
        .setThumbnail(settings.CTweaksIMG)
	  		.setColor(settings.CTweaksColor)
	  		.setFooter('Compliance Tweaks', settings.CTweaksIMG);
      message.channel.send(embed);
      //Compliance Addons
    } else if (message.guild.id === settings.CAddonsID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Addons sites:')
        .addFields(
				  { name: 'Website:', value: 'https://compliancepack.net/addons'},
				  { name: 'CurseForge:', value: 'none'},
          { name: 'Planet Minecraft:', value: 'none'},
		  	)
        .setThumbnail(settings.CAddonsIMG)
	  		.setColor(settings.CAddonsColor)
	  		.setFooter('Compliance Addons', settings.CAddonsIMG);
      message.channel.send(embed);
      //Compliance 32x
    } else if (message.guild.id === settings.C32ID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance 32x sites:')
        .addFields(
				  { name: 'Website:', value: 'https://compliancepack.net/'},
				  { name: 'CurseForge:', value: 'soon'},
          { name: 'Planet Minecraft:', value: 'soon'},
		  	)
        .setThumbnail(settings.C32IMG)
	  		.setColor(settings.C32Color)
	  		.setFooter('Compliance 32x', settings.C32IMG);
      message.channel.send(embed);
      //Compliance 64x
    } else if (message.guild.id === settings.C64ID) { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance 64x sites:')
        .addFields(
				  { name: 'Website:', value: 'https://compliancepack.net/#compliance-64x'},
				  { name: 'CurseForge:', value: 'https://www.curseforge.com/minecraft/texture-packs/compliance-64x'},
          { name: 'Planet Minecraft:', value: 'https://www.planetminecraft.com/texture-pack/compliance-64x/'},
		  	)
        .setThumbnail(settings.C64IMG)
	  		.setColor(settings.C32Color)
	  		.setFooter('Compliance 64x', settings.C64IMG);
      message.channel.send(embed);
      //Other servers
    } else return message.channel.send('I don\'t have any website registered for this server :(');}





    //Compliance Dungeons
    else if (args[0] === 'dungeons') {
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Dungeons sites:')
        .addFields(
				  { name: 'Website:', value: 'https://compliancepack.net/#compliance-dungeons'},
				  { name: 'CurseForge:', value: 'none'},
          { name: 'Planet Minecraft:', value: 'https://www.planetminecraft.com/member/faithful_dungeons/'},
		  	)
        .setThumbnail(settings.CDungeonsIMG)
	  		.setColor(settings.CDungeonsColor)
	  		.setFooter('Compliance Dungeons', settings.CDungeonsIMG);
      message.channel.send(embed);
      //Compliance Mods
    } else if (args[0] === 'mods') { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Mods sites:')
        .addFields(
				  { name: 'Website:', value: 'https://compliancepack.net/mods'},
				  { name: 'CurseForge:', value: 'none'},
          { name: 'Planet Minecraft:', value: 'https://www.planetminecraft.com/member/faithful_mods/'},
		  	)
        .setThumbnail(settings.CModsIMG)
	  		.setColor(settings.CModsColor)
	  		.setFooter('Compliance Mods', settings.CModsIMG);
      message.channel.send(embed);
      //Compliance Tweaks
    } else if (args[0] === 'tweaks') { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Tweaks sites:')
        .addFields(
				  { name: 'Website:', value: 'https://faithfultweaks.com/'},
				  { name: 'CurseForge:', value: 'none'},
          { name: 'Planet Minecraft:', value: 'none'},
		  	)
        .setThumbnail(settings.CTweaksIMG)
	  		.setColor(settings.CTweaksColor)
	  		.setFooter('Compliance Tweaks', settings.CTweaksIMG);
      message.channel.send(embed);
      //Compliance Addons
    } else if (args[0] === 'addons') { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance Addons sites:')
        .addFields(
				  { name: 'Website:', value: 'https://compliancepack.net/addons'},
				  { name: 'CurseForge:', value: 'none'},
          { name: 'Planet Minecraft:', value: 'none'},
		  	)
        .setThumbnail(settings.CAddonsIMG)
	  		.setColor(settings.CAddonsColor)
	  		.setFooter('Compliance Addons', settings.CAddonsIMG);
      message.channel.send(embed);
      //Compliance 32x
    } else if (args[0] === '32'  || args[0] === '32x') { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance 32x sites:')
        .addFields(
				  { name: 'Website:', value: 'https://compliancepack.net/'},
				  { name: 'CurseForge:', value: 'soon'},
          { name: 'Planet Minecraft:', value: 'soon'},
		  	)
        .setThumbnail(settings.C32IMG)
	  		.setColor(settings.C32Color)
	  		.setFooter('Compliance 32x', settings.C32IMG);
      message.channel.send(embed);
      //Compliance 64x
    } else if (args[0] === '64'  || args[0] === '64x') { 
		  const embed = new Discord.MessageEmbed()
	  		.setTitle('Compliance 64x sites:')
        .addFields(
				  { name: 'Website:', value: 'https://compliancepack.net/#compliance-64x'},
				  { name: 'CurseForge:', value: 'https://www.curseforge.com/minecraft/texture-packs/compliance-64x'},
          { name: 'Planet Minecraft:', value: 'https://www.planetminecraft.com/texture-pack/compliance-64x/'},
		  	)
        .setThumbnail(settings.C64IMG)
	  		.setColor(settings.C32Color)
	  		.setFooter('Compliance 64x', settings.C64IMG);
      message.channel.send(embed);
      //Other servers
    } else return message.channel.send('Please specify a valid argument! \nYou can use: \n`32x`, `64x`, `addons`, `tweaks`, `dungeons` and `mods`');
	}
};