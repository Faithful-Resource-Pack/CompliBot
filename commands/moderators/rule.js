const prefix = process.env.PREFIX;

const Discord  = require("discord.js");
const settings = require('../../settings.js');
const strings  = require('../../res/strings');
const colors   = require('../../res/colors');

const { warnUser } = require('../../functions/warnUser.js');

const EDIT = {
	date: '02.04.2021',
	description: 'Merged rule 10 and 12 (now rule 11) as they are very similar.',
	enabled: true
}

const RULES = [
	{
		emoji: '1️⃣',
		sentence: 'Follow [Discord TOS and Guidelines](https://discord.com/terms).'
	},
	{
		emoji: '2️⃣',
		sentence: 'Be considerate of others.'
	},
	{ 
		emoji: '3️⃣',
		sentence: 'No advertising. This means no products or other Discord servers unless another user asks.'
	},
	{
		emoji: '4️⃣',
		sentence: 'No NSFW content, ie explicit photographs or graphic stories. Cursing is generally fine so long as it is not excessive.'
	},
	{
		emoji: '5️⃣',
		sentence: 'Ignoring, not knowing and/or bypassing the rules, as well as not listening to the moderators is no excuse.'
	},
	{
		emoji: '6️⃣',
		sentence: 'No spamming.'
	},
	{
		emoji: '7️⃣',
		sentence: 'Only use `/modping` when it is absolutely necessary.'
	},
	{
		emoji: '8️⃣',
		sentence: 'No politics.'
	},
	{
		emoji: '9️⃣',
		sentence: 'No hate speech. This includes racial slurs, sexual slurs, general derogatory names, etc.'
	},
	{
		emoji: '🔟',
		sentence: 'Don\'t ask to ask, please read FAQ first & ask after.'
	},
	{
		emoji: '1️⃣1️⃣',
		sentence: 'Stay on topic. There are multiple channels with different purposes for a reason.'
	},
	{
		emoji: '1️⃣2️⃣',
		sentence: 'Preferably no talk about why we moved, that is explained in `#faq`'
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

		if (!message.member.hasPermission('ADMINISTRATOR')) return warnUser(message,strings.COMMAND_NO_PERMISSION)

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

			await message.channel.send(embed);

			if (EDIT.enabled && message.guild.id !== "720677267424018526") {
				const embedChanges = new Discord.MessageEmbed()
					.setTitle(`Latest changes as of ${EDIT.date}`)
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