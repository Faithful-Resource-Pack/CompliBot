const translate2 = require('@vitalets/google-translate-api')
const settings = require('../resources/settings.json')

const { MessageEmbed } = require('discord.js');
const { addDeleteReact } = require('../helpers/addDeleteReact')

async function translate(message, content, args) {

	var result = await translate2(content.join(' '), { to: args[0] })
	var langTo = args[0]

	content.shift()
	var embed = new MessageEmbed()
		.setDescription(`\`\`\`${result.text}\`\`\``)
		.setColor(settings.colors.blue)
		.setFooter(`${result.from.language.iso} → ${langTo}`, settings.images.bot)

	const messageEmbed = await message.reply({ embeds: [embed] })
	addDeleteReact(messageEmbed, message, true)
}

exports.translate = translate;