const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const settings = require('../../resources/settings');
const emojis = require('../../resources/emojis');
const { string } = require('../../resources/strings');
const colors = require('../../resources/colors');

const { warnUser } = require('../../helpers/warnUser');
const { addDeleteReact } = require('../../helpers/addDeleteReact');

const DATA = [
	{
		image: settings.C32_IMG,
		color: colors.C32,
		keywords: ['compliance32', 'c32', '32x', '32'],
		name: `Compliance 32x`,
		value: `[<:c32:${emojis.C32}> Website](https://www.compliancepack.net/compliance32x/latest)\n[<:curseforge:${emojis.CURSEFORGE}> CurseForge | Java](https://www.curseforge.com/minecraft/texture-packs/compliance-32x)\n[<:curseforge:${emojis.CURSEFORGE}> CurseForge | Bedrock](https://www.curseforge.com/minecraft-bedrock/addons/compliance-32x-bedrock)\n[<:pmc:${emojis.PMC}> Planet Minecraft](https://www.planetminecraft.com/texture-pack/compliance-32x/)`
	},
	{
		image: settings.C64_IMG,
		color: colors.C64,
		keywords: ['compliance64', 'c64', '64x', '64'],
		name: 'Compliance 64x',
		value: `[<:c64:${emojis.C64}> Website](https://www.compliancepack.net/compliance64x/latest)\n[<:curseforge:${emojis.CURSEFORGE}> CurseForge | Java](https://www.curseforge.com/minecraft/texture-packs/compliance-64x)\n[<:curseforge:${emojis.CURSEFORGE}> CurseForge | Bedrock](https://www.curseforge.com/minecraft-bedrock/addons/compliance-64x-bedrock)\n[<:pmc:${emojis.PMC}> Planet Minecraft](https://www.planetminecraft.com/texture-pack/compliance-64x/)`
	},
	{
		image: settings.CDUNGEONS_IMG,
		color: colors.CDUNGEONS,
		keywords: ['dungeons'],
		name: 'Compliance Dungeons 32x',
		value: `[<:cdungeons:${emojis.CDUNGEONS}> Website](https://www.compliancepack.net/compliance32xDungeons/latest)\n[<:curseforge:${emojis.CURSEFORGE}> CurseForge](https://www.curseforge.com/minecraft-dungeons/mods/compliance-dungeons)`
	},
	{
		image: settings.CMODS_IMG,
		color: colors.CMODS,
		keywords: ['mods'],
		name: 'Compliance Mods 32x',
		value: `[<:cmods:${emojis.CMODS}> Mods Resource Pack picker](https://www.compliancepack.net/mods)\n[<:cmods:${emojis.CMODS}> Modpacks Resource Pack pressets](https://www.compliancepack.net/modpacks)`
	},
	{
		image: settings.CTWEAKS_IMG,
		color: colors.CTWEAKS,
		keywords: ['tweaks'],
		name: 'Compliance Tweaks',
		value: `[<:ctweaks:${emojis.CTWEAKS}> Website](https://www.compliancepack.net/tweaks)`
	},
	{
		image: settings.CADDONS_IMG,
		color: colors.CADDONS,
		keywords: ['addons'],
		name: 'Compliance Addons',
		value: `[<:caddons:${emojis.CADDONS}> All resolutions](https://www.compliancepack.net/addons)\n[<:caddons:${emojis.CADDONS}> Collections](https://www.compliancepack.net/addonCollections)`
	}
]

module.exports = {
	name: 'website',
	aliases: ['site', 'sites', 'websites'],
	description: string('command.description.website'),
	guildOnly: false,
	uses: string('command.use.anyone'),
	category: 'Server',
	syntax: `${prefix}website [keyword]`,
	example: `${prefix}website : only in DM\n${prefix}website compliance32|32x|32\n${prefix}website compliance64|64x|64\n${prefix}website dungeons\n${prefix}website mods\n${prefix}website tweaks\n${prefix}website addons`,
	async execute(client, message, args) {

		let embed = new Discord.MessageEmbed()

		if (!args[0]) {
			if (message.channel.type !== 'DM') return warnUser(message, string('command.website.provide_valid_args'))

			embed
				.setTitle('Websites:')
				.setColor(colors.C32)

			for (let i = 0; i < DATA.length; i++) embed.addField(DATA[i].name, DATA[i].value)

			let embedMessage = await message.reply({ embeds: [embed] })
			return addDeleteReact(embedMessage, message, true)
		}

		for (let i = 0; i < DATA.length; i++) {
			if (DATA[i].keywords.includes(args[0].toLowerCase())) {

				embed
					.setTitle(`${DATA[i].name} websites:`)
					.setDescription(`${DATA[i].value}`)
					.setColor(DATA[i].color)
					.setFooter(`Keywords: ${DATA[i].keywords.join(' | ')}`)
					.setThumbnail(DATA[i].image)

				let embedMessage = await message.reply({ embeds: [embed] })
				return addDeleteReact(embedMessage, message, true)
			}
		}

		return warnUser(message, string('command.website.provide_valid_args'))
	}
}