const prefix = process.env.PREFIX;

const Discord  = require("discord.js");
const settings = require('../../resources/settings');
const strings  = require('../../resources/strings');
const colors   = require('../../resources/colors');

const { warnUser } = require('../../helpers/warnUser');

const EDIT = {
	date: '27/08/2021',
	description: 'Added rule 8 and improved the wording on rule 7. Also changed the translator link on rule 7 to DeepL instead of Google Translate.',
	enabled: true
}

const NUMBER = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

// NOTE : you can't use markdown inside title field
const RULES = [
	{
		title: `**Read & Follow Discord Terms Of Service and Community Guidelines.**`,
		description: `• TOS : https://discord.com/terms
		• Guidelines : https://discord.com/guidelines`
	},
	{
		title: `**Be respectful**`,
		description: `This is your standard "don't be an asshole" rule. Just be polite to others and you'll be fine.

		__Examples of unacceptable behaviour:__
		• Mocking and/or making fun of people, this applies to any kind of mocking.
		• Being unable to accept civil feedback from others. If others can provide constructive criticism for your creation, you must be civil about it too!
		• Renaming yourself to harm someone, a third party or a competitor is not acceptable. Renaming yourself is a right, not a funny feature.

		> These are just examples, and other behaviour not listed here may be considered unacceptable as well.`
	},
	{
		title: `**No spamming or hate speech**`,
		description: `
		__Spamming:__
		This means no random garbage that does not contribute anything to real discussions.
		> That includes walls of text as well as excessively long chains of similar/identical messages.
		
		__Hate speech:__
		That includes, but _is not limited to_: general derogatory names, racial slurs, homophobia, transphobia and other slurs related to sexual orientation/sex/gender...`
	},
	{
		title: `**Be civilized**`,
		description: `__Don't ask to ask:__
		Don't just go in a channel and say "can anybody help me?" – Ask your question directly instead. Also, remember to read our #FAQ.
		
		__Stay on topic:__
		There are multiple channels with different purposes for a reason.

		__Provide constructive criticism:__
		Never say just "that's bad" when giving your opinion on something. Always elaborate on your view, and remember to stay polite!

		__Privacy:__
		Leaking any private information from staff without permission is strictly prohibited.
		> This applies to channel names, as well as all content shared in these private channels.`
	},
	{
		title: `**No NSFW/Prohibited content**`,
		description: `The following is **NOT** allowed at any time, including but not limited to:
		
		• Offensive content
		• Questionable and NSFW content
		• Politics, religion and any contreversial issues.
		• Jokes, memes, and misinformation about past or on-going tragic events.
		• Potentially seizure-inducing animated images/videos.
		• Excessively loud audio/videos.

		> If you think something is NSFW, it is NSFW. Don't post it or DM a Moderator to approve the content you want to post.`
	},
	{
		title: `**No promoting or advertising.**`,
		description: `Unsolicited server invites, referral links, and any/all other unwanted promotional content is not allowed.
		> Resource Packs and anything related to Compliance are allowed, within reason.`
	},
	{
		title: `**Speak english**`,
		description: `This is an English-speaking server. If you cannot fluently write in English, please use a [translator](https://www.deepl.com/translator).
		
		> Developers are currently working on a translation command, but there is currently no ETA when it will be released.`
	},
	{
		title: `**No brigading and/or raiding on other servers in Compliance's name.**`,
		description: `We strictly prohibit this behaviour, as not only it makes the Compliance project look bad, but is uncivil, unfair and against Discord TOS. Any offenders of this rule will suffer harsh punishments.`
	}
]

module.exports = {
	name: 'rule',
	aliases: [ 'rules' ],
	description: strings.HELP_DESC_RULES,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}rule <n>`,
	flags: '',
	example: `${prefix}rule 1`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.name.includes("God"))) return warnUser(message, strings.COMMAND_NO_PERMISSION)

		let thumbnail = settings.BOT_IMG
		let color     = colors.COUNCIL

		switch (message.guild.id) {
			case settings.C32_ID:
				color = colors.C32
				thumbnail = settings.C32_IMG;
				break
			case settings.C64_ID:
				color = colors.C32
				thumbnail = settings.C64_IMG;
				break
			case settings.CEXTRAS_ID:
				color = colors.C32
				thumbnail = settings.CEXTRAS_IMG;
				break
			case settings.CMODS_ID:
				color = colors.CMODS
				break
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

		let rule;

		if (message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("God"))) {
			if (args[0] == 'all') rule = -1;
		} else warnUser(message, "Only Administrators can do that!")

		if (rule != -1) rule = parseInt(args[0], 10)

		if (rule <= RULES.length && rule > 0) {
			const embed = new Discord.MessageEmbed()
				.setTitle(RULES[rule-1].title)
				.setColor(color)
				.setThumbnail(thumbnail)
				.setDescription(RULES[rule-1].description);

			return await message.reply({embeds: [embed]});
		}

		else if (rule == -1) {
			
			let embed = new Discord.MessageEmbed()
				.setTitle(`Rules of the Compliance Discord's Servers`)
				.setColor(color)
				.setThumbnail(thumbnail)
				.setDescription(`**Ignoring, not knowing and/or bypassing the rules, as well as not listening to the moderators is not an excuse for misbehaving.**\nRemember, by talking in this server you're agreeing to follow these rules.`)
			await message.channel.send({embeds: [embed]})
			
			for (let i = 0; i < RULES.length; i++) {
				let embedRule = new Discord.MessageEmbed()
					.setColor(color)
					.setTitle(`${NUMBER[i]} ${RULES[i].title}`)
					.setDescription(RULES[i].description)

				await message.channel.send({embeds: [embedRule]});
			}

			if (EDIT.enabled) {
				const embedChanges = new Discord.MessageEmbed()
					.setTitle(`Latest changes as of the ${EDIT.date}`)
					.setColor(color)
					.setDescription(EDIT.description + '\n\n> Please understand that failing to comply to these rules will result in an adequate punishment.')
					.setFooter(`The rules are subject to change.`, thumbnail)

				await message.channel.send({embeds: [embedChanges]})
			}

			if (!message.deleted) await message.delete();
		}

		// number is out of range
		else return warnUser(message, `You have to specify a number between 1 and ${RULES.length} included.`)

	}
}
