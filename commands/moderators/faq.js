const prefix   = process.env.PREFIX;

const Discord  = require("discord.js");
const settings = require('../../ressources/settings');
const strings  = require('../../ressources/strings');
const colors   = require('../../ressources/colors');

const { warnUser } = require('../../helpers/warnUser');

const FAQS = [
	{
		title: 'What is Compliance? How did it come to be?',
		description: 'Compliance is a Minecraft resource pack available in 32x and 64x resolutions, aiming to provide higher-resolution textures while staying true to the vanilla Minecraft textures. We initially had a breakaway project from Faithful after some disagreements with the owner, but have since moved on and are our own, completely independent pack now.',
		keywords: [
			'compliance'
		]
	},
	{
		title: 'Why is the pack called Compliance?',
		description: 'Since we initially started as a Faithful breakaway, we looked for a name that was similar to Faithful. After some brainstorming we decided on Compliance because it sounded cool and wasn\'t used anywhere else.',
		keywords: [
			'name'
		]
	},
	{
		title: 'Where can I download Compliance?',
		description: 'You can always find the latest release of our pack by clicking this link: \nhttps://compliancepack.net/article/compliance32x/latest',
		keywords: [
			'downloads', 'download'
		]
	},
	{
		title: 'How do I install Compliance/any resource pack?',
		description: 'We recommend giving this Minecraft Wiki page a read: \nhttps://minecraft.fandom.com/wiki/Tutorials/Loading_a_resource_pack',
		keywords: [
			'installation', 'install'
		]
	},
	{
		title: 'Is Compliance available for [Minecraft version]?',
		description: 'Currently, we only officially support the 1.16 versions of the packs. We\'re planning to add support for many other Minecraft: Java Edition versions when the pack fully releases; if 1.17 releases before the pack fully releases, we will switch development to 1.17 and make that our only supported version for the time being. If you\'re living on the edge, you can also try using the packs on the different version branches of our GitHub, but be aware that they might be broken.',
		keywords: [
			'minecraft version'
		]
	},
	{
		title: 'Will Compliance ever be avaliable on the Bedrock Edition Marketplace?',
		description: 'Unfortunately, getting resource packs onto the marketplace is a lengthy and complicated process, and a free pack hasn\'t been published to the marketplace yet. This will take a lot of time, but yes, we are planning to eventually release Compliance on the marketplace if possible. That being said, we want to keep the pack free for everyone, and if releasing a free resource pack on the marketplace is not possible, we will not release Compliance there.',
		keywords: [
			'marketplace'
		]
	},
	{
		title: 'But I don\'t like the new Minecraft textures! Compliance Programmer Art when?',
		description: 'For now, Compliance 32x is only based on Minecraft\'s new textures, or Jappa textures as we call them. A programmer art pack is planned to be announced after the full release of the main 32x pack, after which you\'ll be able to submit textures like you would to the jappa pack. You can already start texturing now if you want, but be aware that your textures won\'t get added into any pack for some time, and that you might end up remaking a texture that we will decide not to include.',
		keywords: [
			'programmer art', 'prog art'
		]
	},
	{
		title: 'I\'ve found a bug in Compliance! Where do I report it?',
		description: 'Please post any bug reports and/or opinions about the pack in <#774246985448030209>.',
		keywords: [
			'bug', 'bugs', 'issue', 'feedback'
		]
	},
	{
		title: 'How can I submit a texture to the pack? How does the approval process work?',
		description: 'If you\'ve made a texture for Compliance, we recommend posting it in <#773987767989305385> first of all to get feedback from others. If you\'ve done that or feel like you don\'t require feedback, post your texture as a __plain PNG image__ in <#773987409993793546>, and title it in this format: `<texture_name> (<optional comment>)` + tag co-authors. In these channels your texture will undergo a 3-day public voting period. If it receieves more upvote reactions than downvote reactions, your texture gets passed on to the Texture Supervision Council that will vote on your texture depending on if it fits the general stylistic direction of our pack. The council has a voting period of 1 day. \nAfter that, if your texture is accepted, it will be posted in <#780507804317384744> and added to the WIP pack on GitHub; your texture will then be released included in the pack in the first release after your texture has passed. \nIf your texture is rejected by the council, it gets revoted on by pack contributors in <#780507681987100682> with a voting period of 3 more days. This is the final vote your texture can undergo, and it determines whether it will be accepted or rejected in the same way as other votes. \nYou will be assigned the Contributor role if at least one of your submitted textures ever passes voting. The role should be assigned automatically, but if it isn\'t please alert the moderators using `/modping` so they can take a look at it.',
		keywords: [
			'submit', 'approval'
		]
	},
	{
		title: 'Does Compliance support mods?',
		description: 'Yes, you can find mod support for the 32x version of the pack at https://compliancepack.net/mods or https://compliancepack.net/modpacks. Please note that the textures may be outdated and that development is not very active at the moment though, and that 64x is not supported at all right now. \nIf you want to contribute to Compliance Mods, join our sister discord server, linked in <#774391640306745374>',
		keywords: [
			'mod support', 'mods', 'mod'
		]
	},
	{
		title: 'How do I install Compliance for Minecraft: Dungeons?',
		description: 'Please read this tutorial and make sure not to skip any steps: https://dokucraft.co.uk/stash/?help=modding-dungeons',
		keywords: [
			'install dungeons', 'dungeons'
		]
	},
	{
		title: 'CompliBot is offline! What do I do?',
		description: 'If the bot ever goes offline without previous notice from the developers, please ping __one__ of the online bot devs (<@473860522710794250> or <@207471947662098432>) and alert them of the issue.',
		keywords: [
			'bot offline', 'bot broke'
		]
	},
	{
		title: 'I have found a bug in CompliBot and I want to request a fix and/or give feedback, how do I do it?',
		description: 'If you find any bugs with the bot and/or have any requests, you can use the `/feedback` command to send feedback directly to the bot developers.',
		keywords: [
			'bot bug', 'bot bugs', 'bot issue'
		]
	}
]

module.exports = {
	name: 'faq',
	description: 'none',
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}faq <keyword>`,
	flags: '',
	example: `${prefix}faq bot offline\n${prefix}faq submit\n\nADMINS ONLY:\n${prefix}faq all`,
	async execute(client, message, args) {
		let color = colors.COUNCIL;

		switch (message.guild.id) {
			case settings.C32_ID:
				color = colors.C32
				break
			case settings.C64_ID:
				color = colors.C32
				break
			case settings.CEXTRAS_ID:
				color = colors.CADDONS
				break
			case settings.CMODS_ID:
				color = colors.CMODS
				break;
			case settings.CTWEAKS_ID:
				color = colors.CTWEAKS
				break
			case settings.CDUNGEONS_ID:
				color = colors.CDUNGEONS
				break

			default:
				color = colors.C32
				break
		}

		let embed
		if (args[0] == 'all') {
			if (message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("God"))) {
				for (let i = 0; i < FAQS.length; i++) {
					embed = new Discord.MessageEmbed()
						.setTitle(FAQS[i].title)
						.setColor(color)
						.setDescription(FAQS[i].description)
						.setFooter(`Keywords: ${FAQS[i].keywords.join(' | ')}`)
					await message.channel.send(embed)
				}
				if (!message.deleted) await message.delete()

			} else warnUser(message, "Only Administrators can do that!")
		} else {
			args = args.join(' ')
			for (let i = 0; i < FAQS.length; i++) {
				if (FAQS[i].keywords.includes(args.toLowerCase())) {
					embed = new Discord.MessageEmbed()
						.setTitle(`FAQ: ${FAQS[i].title}`)
						.setThumbnail(settings.QUESTION_MARK_IMG)
						.setColor(colors.BLUE)
						.setDescription(FAQS[i].description)
						.setFooter(`Keywords: ${FAQS[i].keywords.join(' | ')}`)
					await message.inlineReply(embed)
				}
			}

			if (embed === undefined) return warnUser(message, 'This keyword does not exist or is not attributed!')
		}


	}
}