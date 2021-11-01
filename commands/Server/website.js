const prefix = process.env.PREFIX;

const Discord = require('discord.js')
const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')

const { warnUser } = require('../../helpers/warnUser');
const { addDeleteReact } = require('../../helpers/addDeleteReact');

const DATA = [
	{
		image: settings.images.c32,
		color: settings.colors.c32,
		keywords: ['compliance32', 'c32', '32x', '32'],
		name: `Compliance 32x`,
		value: `[<:c32:${settings.emojis.c32}> Website](https://www.compliancepack.net/compliance32x/latest)\n[<:curseforge:${settings.emojis.curseforge}> CurseForge | Java](https://www.curseforge.com/minecraft/texture-packs/compliance-32x)\n[<:curseforge:${settings.emojis.curseforge}> CurseForge | Bedrock](https://www.curseforge.com/minecraft-bedrock/addons/compliance-32x-bedrock)\n[<:pmc:${settings.emojis.planetMC}> Planet Minecraft](https://www.planetminecraft.com/texture-pack/compliance-32x/)`
	},
	{
		image: settings.images.c64,
		color: settings.colors.c64,
		keywords: ['compliance64', 'c64', '64x', '64'],
		name: 'Compliance 64x',
		value: `[<:c64:${settings.emojis.c64}> Website](https://www.compliancepack.net/compliance64x/latest)\n[<:curseforge:${settings.emojis.curseforge}> CurseForge | Java](https://www.curseforge.com/minecraft/texture-packs/compliance-64x)\n[<:curseforge:${settings.emojis.curseforge}> CurseForge | Bedrock](https://www.curseforge.com/minecraft-bedrock/addons/compliance-64x-bedrock)\n[<:pmc:${settings.emojis.planetMC}> Planet Minecraft](https://www.planetminecraft.com/texture-pack/compliance-64x/)`
	},
	{
		image: settings.images.cdungeons,
		color: settings.colors.cdungeons,
		keywords: ['dungeons'],
		name: 'Compliance Dungeons 32x',
		value: `[<:cdungeons:${settings.emojis.cdungeons}> Website](https://www.compliancepack.net/compliance32xDungeons/latest)\n[<:curseforge:${settings.emojis.curseforge}> CurseForge](https://www.curseforge.com/minecraft-dungeons/mods/compliance-dungeons)`
	},
	{
		image: settings.images.cmods,
		color: settings.colors.cmods,
		keywords: ['mods'],
		name: 'Compliance Mods 32x',
		value: `[<:cmods:${settings.emojis.cmods}> Mods Resource Pack picker](https://www.compliancepack.net/mods)\n[<:cmods:${settings.emojis.cmods}> Modpacks Resource Pack pressets](https://www.compliancepack.net/modpacks)`
	},
	{
		image: settings.images.ctweaks,
		color: settings.colors.ctweaks,
		keywords: ['tweaks'],
		name: 'Compliance Tweaks',
		value: `[<:ctweaks:${settings.emojis.ctweaks}> Website](https://www.compliancepack.net/tweaks)`
	},
	{
		image: settings.images.caddons,
		color: settings.colors.caddons,
		keywords: ['addons'],
		name: 'Compliance Addons',
		value: `[<:caddons:${settings.emojis.caddons}> All resolutions](https://www.compliancepack.net/addons)\n[<:caddons:${settings.emojis.caddons}> Collections](https://www.compliancepack.net/addonCollections)`
	}
]

module.exports = {
	name: 'website',
	aliases: ['site', 'sites', 'websites'],
	description: strings.command.description.website,
	category: 'Server',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}website [keyword]`,
	example: `${prefix}website : only in DM\n${prefix}website compliance32|32x|32\n${prefix}website compliance64|64x|64\n${prefix}website dungeons\n${prefix}website mods\n${prefix}website tweaks\n${prefix}website addons`,
	async execute(client, message, args) {

		let embed = new Discord.MessageEmbed()

		if (!args[0]) {
			if (message.channel.type !== 'DM') return warnUser(message, strings.command.website.provide_valid_args)

			embed
				.setTitle('Websites:')
				.setColor(settings.colors.c32)

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

		return warnUser(message, strings.command.website.provide_valid_args)
	}
}