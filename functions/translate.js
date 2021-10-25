const Discord    = require('discord.js')
const translate2 = require('@vitalets/google-translate-api')

const colors   = require('../resources/colors')
const settings = require('../resources/settings')

const { addDeleteReact } = require('../helpers/addDeleteReact')

async function translate(message, content, args) {

	var result = await translate2(content.join(' '), {to: args[0]})
	var langTo = args[0]

	content.shift()
	var embed = new Discord.MessageEmbed()
		.setDescription(`\`\`\`${result.text}\`\`\``)
		.setColor(colors.BLUE)
		.setFooter(`${result.from.language.iso} → ${langTo}`, settings.BOT_IMG)

	const messageEmbed = await message.reply({embeds: [embed]})
	addDeleteReact(messageEmbed, message, true)
}

exports.translate = translate;