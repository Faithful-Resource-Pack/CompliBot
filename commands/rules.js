const Discord  = require("discord.js");
const settings = require('../settings.js');
const speech = require('../messages.js');

uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'rules',
	description: 'Creates rules embed',
	execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ) {
			if (message.guild.id === settings.C32ID) {
				const embed1 = new Discord.MessageEmbed()
					.setTitle('Rules')
					.setColor(settings.C32Color)
					.setThumbnail(settings.C32IMG)
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
					.setFooter('The rules are subject to change, last edited: 30.11.2020', settings.C32IMG);

				const embed2 = new Discord.MessageEmbed()
					.setTitle('Latest changes as of 30.11.2020')
					.setColor(settings.C32Color)
					.setDescription('- edited rule 5️⃣: Removed a duplicate mention. \n- edited rule 7️⃣: Replaced `@mods` with `/modping`');

				message.channel.send(embed1).then(msg => {message.channel.send(embed2);});
			} else if (message.guild.id === settings.C64ID) {
				const embed1 = new Discord.MessageEmbed()
					.setTitle('Rules')
					.setColor(settings.C32Color)
					.setThumbnail(settings.C64IMG)
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
					.setFooter('The rules are subject to change, last edited: 30.11.2020', settings.C64IMG);

			/*
				const embed2 = new Discord.MessageEmbed()
					.setTitle('Latest changes as of 30.11.2020')
					.setColor(settings.C32Color)
					.setDescription('- edited rule 5️⃣: Removed a duplicate mention. \n- edited rule 7️⃣: Replaced `@mods` with `/modping`');
			*/
				message.channel.send(embed1)
				//.then(msg => {message.channel.send(embed2);});
			} if (message.guild.id === settings.CModsID) {
				const embed1 = new Discord.MessageEmbed()
					.setTitle('Rules')
					.setColor(settings.CModsColor)
					.setThumbnail(settings.CModsIMG)
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
					.setFooter('The rules are subject to change, last edited: 30.11.2020', settings.CModsIMG);

				/*const embed2 = new Discord.MessageEmbed()
					.setTitle('Latest changes as of 30.11.2020')
					.setColor(settings.C32Color)
					.setDescription('- edited rule 5️⃣: Removed a duplicate mention. \n- edited rule 7️⃣: Replaced `@mods` with `/modping`');*/

				message.channel.send(embed1)
        //.then(msg => {message.channel.send(embed2);});
			} else if (message.guild.id === settings.CTweaksID) {
				const embed1 = new Discord.MessageEmbed()
					.setTitle('Rules')
					.setColor(settings.CTweaksColor)
					.setThumbnail(settings.CTweaksIMG)
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
					.setFooter('The rules are subject to change, last edited: 30.11.2020', settings.CTweaksIMG);

				/*const embed2 = new Discord.MessageEmbed()
					.setTitle('Latest changes as of 30.11.2020')
					.setColor(settings.C32Color)
					.setDescription('- edited rule 5️⃣: Removed a duplicate mention. \n- edited rule 7️⃣: Replaced `@mods` with `/modping`');
*/
				message.channel.send(embed1)
        //.then(msg => {message.channel.send(embed2);});
			}
		}
		else { 
			return message.reply(speech.BOT_NO_PERMISSION)
			.then(msg => {
				msg.delete({timeout: 30000});
				message.react('❌');
			});
		}
	}
};