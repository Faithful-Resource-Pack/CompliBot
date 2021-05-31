const prefix = process.env.PREFIX;

const Discord  = require("discord.js");
const settings = require('../../ressources/settings.js');
const strings  = require('../../ressources/strings');
const colors   = require('../../ressources/colors');

const { warnUser } = require('../../helpers/warnUser.js');

const EDIT = {
	date: '31/05/2021',
	description: 'Fixed typo.',
	enabled: true
}

const RULES = [
	{
		emoji: '1️⃣',
		sentence: '**Follow [Discord TOS and Guidelines](https://discord.com/terms).**'
	},
	{
		emoji: '2️⃣',
		sentence: '**Be respectful of others.**\nThis is your standard "don\'t be a dick" rule. Just be polite to others and you\'ll be fine.\n\n__Examples of unacceptable behaviour:__\n• Mocking and/or making fun of people, especially after being told to stop.\n• Being unable to accept civil feedback from others. If others can provide constructive criticism for your creation, you can be civil about it too!\n\nThese are just examples, and other behaviour not listed here may be considered unacceptable as well.\n\n__The following behaviour does NOT fall under this rule:__\n• Obvious jokes. Harmless funny teasing is fine, just don\'t let it go too far.\n• Feedback on creations, as long as it\'s civil and constructive.'
	},
	{ 
		emoji: '3️⃣',
		sentence: '**No advertising.**\nThis means no advertising of products or other Discord servers unless another user asks.'
	},
	{
		emoji: '4️⃣',
		sentence: '**No NSFW content, including but not limited to explicit photographs or graphic stories.**\nIf you think something is NSFW, it is NSFW. Don\'t post it. (or DM a moderator to approve the image)'
	},
	{
		emoji: '5️⃣',
		sentence: '**Provide constructive criticism.**\nNever say just "that\'s bad" when giving your opinion on something. Always elaborate on your view, and remember to stay polite!'
	},
	{
		emoji: '6️⃣',
		sentence: '**No spamming.**\nThat includes walls of text as well as excessively long chains of similar/identical messages.'
	},
	{
		emoji: '7️⃣',
		sentence: '**Absolutely no politics.**\nThis is a Minecraft resource pack server. Take your political discussions somewhere else. That includes talking about recent political events.'
	},
	{
		emoji: '8️⃣',
		sentence: '**No hate speech.**\nThat includes, but is not limited to: racial slurs, homophobia, transphobia and other slurs related to sexual orientation/sex/gender, general derogatory names etc.'
	},
	{
		emoji: '9️⃣',
		sentence: '**Don\'t ask to ask.**\nDon\'t just go in a channel and say "can anybody help me?" – Ask your question directly instead. Also, remember to read our FAQ.'
	},
	{
		emoji: '🔟',
		sentence: '**Stay on topic.**\nThere are multiple channels with different purposes for a reason.'
	},
	{
		emoji: '1️⃣1️⃣',
		sentence: '**Leaking private information from staff without permission is strictly prohibited.**\nThis applies to channel names, as well as all content shared in these private channels.'
	},
	{
		emoji: '1️⃣2️⃣',
		sentence: '**Ignoring, not knowing and/or bypassing the rules, as well as not listening to the moderators is not an excuse for misbehaving.**\nRemember, by talking in this server you\'re agreeing to follow these rules.'
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

		if (!message.member.hasPermission('ADMINISTRATOR')) return warnUser(message, strings.COMMAND_NO_PERMISSION)

		let thumbnail = settings.BOT_IMG;
		let color     = colors.COUNCIL;

		if (message.guild.id === settings.C32_ID) {
			thumbnail = settings.C32_IMG;
			color     = colors.C32;
		}
		if (message.guild.id === settings.C64_ID) {
			thumbnail = settings.C64_IMG;
			color     = colors.C32;
		}
		if (message.guild.id === settings.CADDONS_ID) {
			thumbnail = settings.CADDONS_IMG;
			color     = colors.CADDONS;
		}
		if (message.guild.id === settings.CMODS_ID) {
			thumbnail = settings.CMODS_IMG;
			color     = colors.CMODS;
		}
		if (message.guild.id === settings.CTWEAKS_ID) {
			thumbnail = settings.CTWEAKS_IMG;
			color     = colors.CTWEAKS;
		}
		if (message.guild.id === settings.CDUNGEONS_ID) {
			thumbnail = settings.CDUNGEONS_IMG;
			color     = colors.CDUNGEONS;
		}

		let rule;

		if (parseInt(args[0]) || args[0] == 'all') {
			if (args[0] == 'all') rule = -1;
			else rule = parseInt(args[0]); 
		} else warnUser(message, 'You did not provide a number')

		if (rule <= RULES.length && rule > 0) {
			const embed = new Discord.MessageEmbed()
				.setTitle(`Rule ${rule}`)
				.setColor(color)
				.setThumbnail(thumbnail)
				.setDescription(RULES[rule-1].sentence);

			return await message.inlineReply(embed);
		}

		else if (rule == -1) {
			
			var embed = new Discord.MessageEmbed()
				.setTitle(`Rules of the Compliance Discord's Servers`)
				.setColor(color)
				.setThumbnail(thumbnail)
				.setFooter(`The rules are subject to change, last edited: ${EDIT.date}`, thumbnail);

			if (message.guild.id === "720677267424018526") {
				embed.addFields({
					name: '1️⃣',
					value: 'No rules.'
				})
			}
			else {
				for (let i = 0; i < RULES.length; i++) {
					embed.addFields({
						name:  RULES[i].emoji,
						value: RULES[i].sentence
					});
				}
			}
			embed.addField('\u200B', 'Please understand that failing to comply to these rules will result in an adequate punishment.')

			await message.channel.send(embed);

			if (EDIT.enabled && message.guild.id !== "720677267424018526") {
				const embedChanges = new Discord.MessageEmbed()
					.setTitle(`Latest changes as of the ${EDIT.date}`)
					.setColor(color)
					.setDescription(EDIT.description);

				await message.channel.send(embedChanges);
			}

			if (!message.deleted) await message.delete();
		}

		// number is out of range
		else return warnUser(message, `You have to specify a number between 1 and ${RULES.length} included.`);

	}
}