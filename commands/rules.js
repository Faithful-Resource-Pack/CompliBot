const prefix = process.env.PREFIX;

const Discord  = require("discord.js");
const settings = require('../settings.js');
const strings  = require('../res/strings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;

module.exports = {
	name: 'rules',
	description: strings.HELP_DESC_RULES,
	guildOnly: true,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}rules`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ) {
			if (message.guild.id === settings.C32_ID) {
				const embed1 = new Discord.MessageEmbed()
					.setTitle('Rules')
					.setColor(settings.C32_COLOR)
					.setThumbnail(settings.C32_IMG)
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

				await message.channel.send(embed1);
				//await message.channel.send(embed2);
			}
		}
		else return
	}
};
