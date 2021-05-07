const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const settings = require('../settings.js');
const strings  = require('../res/strings');
const colors   = require('../res/colors');

const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'website',
	aliases: ['site', 'sites', 'websites'],
	description: strings.HELP_DESC_WEBSITE,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
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

			const embedMessage = await message.inlineReply(embed);
			if (message.channel.type !== 'dm') await embedMessage.react('🗑️');

			const filter = (reaction, user) => {
				return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
			};

			embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
				.then(async collected => {
					const reaction = collected.first();
					if (reaction.emoji.name === '🗑️') {
						await embedMessage.delete();
						if (!message.deleted && message.channel.type !== 'dm') await message.delete();
					}
				})
				.catch(async collected => {
					if (!message.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🗑️').remove();
				});
		}

		if (!args.length) {
			if (message.channel.type !== 'dm') {
				//Compliance Dungeons
				if (message.guild.id === settings.CDUNGEONS__ID) {
					websiteEmbed(
						'Compliance Dungeons',
						'https://compliancepack.net/#compliance-dungeons',
						'soon™',
						'https://www.planetminecraft.com/member/faithful_dungeons/',
						settings.CDUNGEONS_IMG,
						colors.CDUNGEONS
					);
				//Compliance Mods
				} else if (message.guild.id === settings.CMODS__ID) {
					websiteEmbed(
						'Compliance Mods',
						'https://compliancepack.net/mods',
						'none',
						'https://www.planetminecraft.com/member/faithful_mods/',
						settings.CMODS_IMG,
						colors.CMODS
					);
				//Compliance Tweaks
				} else if (message.guild.id === settings.CTWEAKS_ID) {
					websiteEmbed(
						'Compliance Tweaks',
						'https://faithfultweaks.com/',
						'none',
						'none',
						settings.CTWEAKS_IMG,
						colors.CTWEAKS
				);
				//Compliance Addons
				} else if (message.guild.id === settings.CADDONS_ID) {
					websiteEmbed(
						'Compliance Addons',
						'https://compliancepack.net/addons',
						'none',
						'none',
						settings.CADDONS_IMG,
						colors.CADDONS
					);
				//Compliance 32x
				} else if (message.guild.id === settings.C32_ID) {
					websiteEmbed(
						'Compliance 32x',
						'https://compliancepack.net/',
						'https://www.curseforge.com/minecraft/texture-packs/compliance-32x',
						'https://www.planetminecraft.com/texture-pack/compliance-32x/',
						settings.C32_IMG,
						colors.C32
					);
				//Compliance 64x
				} else if (message.guild.id === settings.C64_ID) {
					websiteEmbed(
						'Compliance 64x',
						'https://compliancepack.net/#compliance-64x',
						'https://www.curseforge.com/minecraft/texture-packs/compliance-64x',
						'https://www.planetminecraft.com/texture-pack/compliance-64x/',
						settings.C64_IMG,
						colors.C32
					);
				//Other servers
				} else return warnUser(message, strings.WEBSITE_NO_SITE_REGISTERED);
    		} else return warnUser(message, strings.WEBSITE_PROVIDE_VALID_ARGUMENT);
    	}

		//Compliance Dungeons
		else if (args[0] === 'dungeons') {
			websiteEmbed(
				'Compliance Dungeons',
				'https://compliancepack.net/#compliance-dungeons',
				'soon™',
				'https://www.planetminecraft.com/member/faithful_dungeons/',
				settings.CDUNGEONS_IMG,
				colors.CDUNGEONS
			);
		//Compliance Mods
		} else if (args[0] === 'mods') {
			websiteEmbed(
				'Compliance Mods',
				'https://compliancepack.net/mods',
				'none',
				'https://www.planetminecraft.com/member/faithful_mods/',
				settings.CMODS_IMG,
				colors.CMODS
			);
		//Compliance Tweaks
		} else if (args[0] === 'tweaks') {
			websiteEmbed(
				'Compliance Tweaks',
				'https://faithfultweaks.com/',
				'none',
				'none',
				settings.CTWEAKS_IMG,
				colors.CTWEAKS
			);
		//Compliance Addons
		} else if (args[0] === 'addons') {
			websiteEmbed(
				'Compliance Addons',
				'https://compliancepack.net/addons',
				'none',
				'none',
				settings.CADDONS_IMG,
				colors.CADDONS
			);
		//Compliance 32x
		} else if (args[0] === '32'  || args[0] === '32x') {
			websiteEmbed(
				'Compliance 32x',
				'https://compliancepack.net/',
				'https://www.curseforge.com/minecraft/texture-packs/compliance-32x',
				'https://www.planetminecraft.com/texture-pack/compliance-32x/',
				settings.C32_IMG,
				colors.C32
			);
		//Compliance 64x
		} else if (args[0] === '64'  || args[0] === '64x') {
			websiteEmbed(
				'Compliance 64x',
				'https://compliancepack.net/#compliance-64x',
				'https://www.curseforge.com/minecraft/texture-packs/compliance-64x', 'https://www.planetminecraft.com/texture-pack/compliance-64x/',
				settings.C64_IMG,
				colors.C32
			);
		//Other servers
		} else return warnUser(message, strings.WEBSITE_PROVIDE_VALID_ARGUMENT);
	}
};
