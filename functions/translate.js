const Discord   = require('discord.js');
const translate2 = require('@vitalets/google-translate-api');

const colors   = require('../res/colors');
const settings = require('../settings.js');

async function translate(message, content, args) {

	var result = await translate2(content.join(' '), {to: args[0]});
	var langTo = args[0]

	content.shift()
	var embed = new Discord.MessageEmbed()
		.setDescription(`\`\`\`${result.text}\`\`\``)
		.setColor(colors.BLUE)
		.setFooter(`${result.from.language.iso} → ${langTo}`, settings.BOT_IMG);

	var embedMessage = await message.inlineReply(embed);
}

exports.translate = translate;