const Discord  = require('discord.js');
const settings = require('../settings');
const colors   = require('../res/colors');
const strings  = require('../res/strings');

async function autoReact(message, emojis, errorType, errorSpecificType, specific) {

	if (message.attachments.size > 0) {

		let specificResult = true;

		if (specific) {
			let i = 0;
			while (specific[i]) {
				if (!message.content.includes(specific[i])) {
					specificResult = false;
					break;
				}
				i++;
			}

		}
		else specificResult = true;

		if (specificResult == true) {
			for (var i = 0; i < emojis.length; i++){
				try {
					await message.react(emojis[i]);
				} catch (error) {
					console.error('Error: emoji n°'+i+' failed to react'+error);
				}
			}
		} else return sendError(true);
	}
	else return sendError(false);

	async function sendError(specificError) {

		if (
			(
				message.member.hasPermission('ADMINISTRATOR')
			) && specificError == false
		) return;

		else {
      try {
        var embed = new Discord.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setColor(colors.RED)
          .setTitle(strings.BOT_AUTOREACT_ERROR)
          .setFooter('Submission will be removed in 30 seconds, please re-submit', settings.BOT_IMG);

        if (specificError) embed.setDescription(errorSpecificType);
        else embed.setDescription(errorType);

        const msg = await message.channel.send(embed);
        await msg.delete({timeout: 30000});
        if (!message.deleted) await message.delete({timeout: 10});
      } catch(error) {
        console.error(error)
      }
		}
	}
}

exports.autoReact = autoReact;