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
			color     = colors.C64;
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

			return await message.channel.send(embed);
		}

		else if (rule == -1) {
			var embed = new Discord.MessageEmbed()
				.setTitle(`Rules of the Compliance Discord's Servers`)
				.setColor(color)
				.setThumbnail(thumbnail)
				.setFooter(`The rules are subject to change, last edited: ${EDIT.date}`, thumbnail);

			for (let i = 0; i < RULES.length; i++) {
				embed.addFields({
					name:  RULES[i].emoji,
					value: RULES[i].sentence
				});
			}

			await message.channel.send(embed);

			if (EDIT.enabled) {
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

/*
		if (message.author.id === uidR || message.author.id === uidJ) {
			if (message.guild.id === settings.C32_ID) {
				const embed1 = new Discord.MessageEmbed()
					.setTitle('Rules')
					.setColor(settings.C32_COLOR)
					.setThumbnail(settings.C32_IMG)
					.addFields(
						{ name: , value: ''},
						{ name: '', value: ''},
						{ name: '', value: ''},
						{ name: '1️⃣0️⃣', value: ''},
						{ name: '', value: ''},
						{ name: '', value: ''},
						{ name: '', value: ''}
					)
					.setFooter('The rules are subject to change, last edited: 08.01.2021', settings.C32_IMG);

				const embed2 = new Discord.MessageEmbed()
					.setTitle('Latest changes as of 08.01.2021')
					.setColor(settings.C32_COLOR)
					.setDescription('- Added a link to the Discord Terms of Service.');

				await message.channel.send(embed1);
        await message.channel.send(embed2);
			} else if (message.guild.id === settings.C64_ID) {
				const embed1 = new Discord.MessageEmbed()
					.setTitle('Rules')
					.setColor(settings.C32_COLOR)
					.setThumbnail(settings.C64_IMG)
					.addFields(
						{ name: '1️⃣', value: 'Follow [Discord TOS and Guidelines](https://discord.com/terms).'},
						{ name: '2️⃣', value: 'Be considerate of others.'},
						{ name: '3️⃣', value: 'No advertising. This means no products or other Discord servers unless another user asks.'},
						{ name: '4️⃣', value: 'No NSFW content, ie explicit photographs or graphic stories. Cursing is generally fine so long as it is not excessive.'},
						{ name: '5️⃣', value: 'Ignoring, not knowing and/or bypassing the rules, as well as not listening to the moderators is no excuse.'},
						{ name: '6️⃣', value: 'No spamming.'},
						{ name: '7️⃣', value: 'Only use `/modping` when it is absolutely necessary.'},
						{ name: '8️⃣', value: 'No politics.'},
						{ name: '9️⃣', value: 'No hate speech. This includes racial slurs, sexual slurs, general derogatory names, etc.'},
						{ name: '1️⃣0️⃣', value: 'Respect channels for what they are made.'},
						{ name: '1️⃣1️⃣', value: 'Don\'t ask to ask, just read FAQ first & ask after.'},
						{ name: '1️⃣2️⃣', value: 'Stay on topic. There are multiple channels with different purposes for a reason.'},
						{ name: '1️⃣3️⃣', value: 'Preferably no talk about why we moved, that is explained in `#faq`'}
					)
					.setFooter('The rules are subject to change, last edited: 08.01.2021', settings.C64_IMG);

				const embed2 = new Discord.MessageEmbed()
					.setTitle('Latest changes as of 08.01.2021')
					.setColor(settings.C32_COLOR)
					.setDescription('- Added a link to the Discord Terms of Service.');

				await message.channel.send(embed1);
				await message.channel.send(embed2);
			} if (message.guild.id === settings.CMODS_ID) {
				const embed1 = new Discord.MessageEmbed()
					.setTitle('Rules')
					.setColor(settings.CMODS_COLOR)
					.setThumbnail(settings.CMODS_IMG)
					.addFields(
						{ name: '1️⃣', value: 'Follow Discord TOS and Guidelines.'},
						{ name: '2️⃣', value: 'Be considerate of others.'},
						{ name: '3️⃣', value: 'No advertising. This means no products or other Discord servers unless another user asks.'},
						{ name: '4️⃣', value: 'No NSFW content, ie explicit photographs or graphic stories. Cursing is generally fine so long as it is not excessive.'},
						{ name: '5️⃣', value: 'Ignoring, not knowing and/or bypassing the rules, as well as not listening to the moderators is no excuse.'},
						{ name: '6️⃣', value: 'No spamming.'},
						{ name: '7️⃣', value: 'Only use `/modping` when it is absolutely necessary.'},
						{ name: '8️⃣', value: 'No politics.'},
						{ name: '9️⃣', value: 'No hate speech. This includes racial slurs, sexual slurs, general derogatory names, etc.'},
						{ name: '1️⃣0️⃣', value: 'Respect channels for what they are made.'},
						{ name: '1️⃣1️⃣', value: 'Don\'t ask to ask, just read FAQ first & ask after.'},
						{ name: '1️⃣2️⃣', value: 'Stay on topic. There are multiple channels with different purposes for a reason.'},
						{ name: '1️⃣3️⃣', value: 'Preferably no talk about why we moved, that is explained in `#faq`'}
					)
					.setFooter('The rules are subject to change, last edited: 30.11.2020', settings.CMODS_IMG);

				/*const embed2 = new Discord.MessageEmbed()
					.setTitle('Latest changes as of 30.11.2020')
					.setColor(settings.C32_COLOR)
					.setDescription('- edited rule 5️⃣: Removed a duplicate mention. \n- edited rule 7️⃣: Replaced `@mods` with `/modping`');*/
/*
				await message.channel.send(embed1);
				//await message.channel.send(embed2);
			} else if (message.guild.id === settings.CTWEAKS_ID) {
				const embed1 = new Discord.MessageEmbed()
					.setTitle('Rules')
					.setColor(settings.CTWEAKS_COLOR)
					.setThumbnail(settings.CTWEAKS_IMG)
					.addFields(
						{ name: '1️⃣', value: 'Follow Discord TOS and Guidelines.'},
						{ name: '2️⃣', value: 'Be considerate of others.'},
						{ name: '3️⃣', value: 'No advertising. This means no products or other Discord servers unless another user asks.'},
						{ name: '4️⃣', value: 'No NSFW content, ie explicit photographs or graphic stories. Cursing is generally fine so long as it is not excessive.'},
						{ name: '5️⃣', value: 'Ignoring, not knowing and/or bypassing the rules, as well as not listening to the moderators is no excuse.'},
						{ name: '6️⃣', value: 'No spamming.'},
						{ name: '7️⃣', value: 'Only use `/modping` when it is absolutely necessary.'},
						{ name: '8️⃣', value: 'No politics.'},
						{ name: '9️⃣', value: 'No hate speech. This includes racial slurs, sexual slurs, general derogatory names, etc.'},
						{ name: '1️⃣0️⃣', value: 'Respect channels for what they are made.'},
						{ name: '1️⃣1️⃣', value: 'Don\'t ask to ask, just read FAQ first & ask after.'},
						{ name: '1️⃣2️⃣', value: 'Stay on topic. There are multiple channels with different purposes for a reason.'},
						{ name: '1️⃣3️⃣', value: 'Preferably no talk about why we moved, that is explained in `#faq`'}
					)
					.setFooter('The rules are subject to change, last edited: 30.11.2020', settings.CTWEAKS_IMG);

				/*const embed2 = new Discord.MessageEmbed()
					.setTitle('Latest changes as of 30.11.2020')
					.setColor(settings.C32_COLOR)
					.setDescription('- edited rule 5️⃣: Removed a duplicate mention. \n- edited rule 7️⃣: Replaced `@mods` with `/modping`');*/
/*
				await message.channel.send(embed1);
				//await message.channel.send(embed2);
			}
		}
		else return
	}
};
*/