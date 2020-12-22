const Discord  = require('discord.js');
const settings = require('../settings.js');

module.exports = {
	name: 'website',
	aliases: ['site', 'sites', 'websites'],
	description: 'Displays the website of the discord',
	uses: 'Anyone',
	syntax: `${prefix}website [type]`,
	async execute(client, message, args) {

    async function websiteEmbed (title, website, curseforge, planetminecraft, img, color) {
      const embed = new Discord.MessageEmbed()
	    	.setTitle(title + ' sites:')
	    	.addFields(
	    		{ name: 'Website:', value: website},
	    		{ name: 'CurseForge:', value: curseforge},
	    		{ name: 'Planet Minecraft:', value: planetminecraft},
    		)
	    	.setThumbnail(img)
	    	.setColor(color)
	    	.setFooter(title, img);
	    const embedMessage = await message.channel.send(embed);
      await embedMessage.react('🗑️');
      const filter = (reaction, user) => {
			  return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
	    };
        	
      embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			  .then(async collected => {
				  const reaction = collected.first();
				  if (reaction.emoji.name === '🗑️') {
				  	await embedMessage.delete();
            await message.delete();
				  }
			  })
        .catch(async collected => {
		      await embedMessage.reactions.cache.get('🗑️').remove();
	      });
    }

		if (!args.length) {
      if (message.channel.type !== 'dm') {
			  //Compliance Dungeons
			if (message.guild.id === settings.CDungeonsID) {
        websiteEmbed(
					'Compliance Dungeons', 
					'https://compliancepack.net/#compliance-dungeons', 
					'soon™', 
					'https://www.planetminecraft.com/member/faithful_dungeons/', 
					settings.CDungeonsIMG, 
					settings.CDungeonsColor
				);
				//Compliance Mods
			} else if (message.guild.id === settings.CModsID) {
        websiteEmbed(
					'Compliance Mods', 
					'https://compliancepack.net/mods', 
					'none', 
					'https://www.planetminecraft.com/member/faithful_mods/', 
					settings.CModsIMG, 
					settings.CModsColor
				);
				//Compliance Tweaks
			} else if (message.guild.id === settings.CTweaksID) {
        websiteEmbed(
					'Compliance Tweaks', 
					'https://faithfultweaks.com/', 
					'none', 
					'none', 
					settings.CTweaksIMG, 
					settings.CTweaksColor
				);
				//Compliance Addons
			} else if (message.guild.id === settings.CAddonsID) {
        websiteEmbed(
					'Compliance Addons', 
					'https://compliancepack.net/addons', 
					'none', 
					'none', 
					settings.CAddonsIMG, 
					settings.CAddonsColor
				);
				//Compliance 32x
			} else if (message.guild.id === settings.C32ID) {
        websiteEmbed(
					'Compliance 32x', 
					'https://compliancepack.net/', 
					'soon™', 
					'soon™', 
					settings.C32IMG, 
					settings.C32Color
				);
				//Compliance 64x
			} else if (message.guild.id === settings.C64ID) {
        websiteEmbed(
					'Compliance 64x', 
					'https://compliancepack.net/#compliance-64x', 
					'https://www.curseforge.com/minecraft/texture-packs/compliance-64x', 'https://www.planetminecraft.com/texture-pack/compliance-64x/', 
					settings.C64IMG, 
					settings.C32Color
				);
				//Other servers
			} else return await message.channel.send('I don\'t have any website registered for this server :(');
    } else return await message.channel.send('Please specify a valid argument! \nYou can use: \n`32x`, `64x`, `addons`, `tweaks`, `dungeons` and `mods`');
    }

		//Compliance Dungeons
		else if (args[0] === 'dungeons') {
			websiteEmbed(
				'Compliance Dungeons', 
				'https://compliancepack.net/#compliance-dungeons', 
				'soon™', 
				'https://www.planetminecraft.com/member/faithful_dungeons/', 
				settings.CDungeonsIMG, 
				settings.CDungeonsColor
			);
			//Compliance Mods
		} else if (args[0] === 'mods') {
			websiteEmbed(
				'Compliance Mods', 
				'https://compliancepack.net/mods', 
				'none', 
				'https://www.planetminecraft.com/member/faithful_mods/', 
				settings.CModsIMG, 
				settings.CModsColor
			);
			//Compliance Tweaks
		} else if (args[0] === 'tweaks') {
			websiteEmbed(
				'Compliance Tweaks', 
				'https://faithfultweaks.com/', 
				'none', 
				'none', 
				settings.CTweaksIMG, 
				settings.CTweaksColor
			);
			//Compliance Addons
		} else if (args[0] === 'addons') {
			websiteEmbed(
				'Compliance Addons', 
				'https://compliancepack.net/addons', 
				'none', 
				'none', 
				settings.CAddonsIMG, 
				settings.CAddonsColor
			);
			//Compliance 32x
		} else if (args[0] === '32'  || args[0] === '32x') {
			websiteEmbed(
				'Compliance 32x', 
				'https://compliancepack.net/', 
				'soon™', 
				'soon™', 
				settings.C32IMG, 
				settings.C32Color
			);
			//Compliance 64x
		} else if (args[0] === '64'  || args[0] === '64x') {
			websiteEmbed(
				'Compliance 64x', 
				'https://compliancepack.net/#compliance-64x', 
				'https://www.curseforge.com/minecraft/texture-packs/compliance-64x', 'https://www.planetminecraft.com/texture-pack/compliance-64x/', 
				settings.C64IMG, 
				settings.C32Color
			);
			//Other servers
		} else return await message.channel.send('Please specify a valid argument! \nYou can use: \n`32x`, `64x`, `addons`, `tweaks`, `dungeons` and `mods`');
	}
};