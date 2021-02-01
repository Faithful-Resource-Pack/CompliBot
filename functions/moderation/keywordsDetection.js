const Discord  = require('discord.js');
const colors   = require('../../res/colors.js');
const keywords = require('../../res/keywords.js');

async function keywordsDetection(client, message) {
	var matchingWords = []
	var reasons = []
	keywords.POLITICAL.forEach(word => {
		if (includesWord(message.content.toLowerCase(), word.toLowerCase())) {
			matchingWords.push(word);
			if (!reasons.includes('politics')) reasons.push('politics');
		}
	})

	keywords.HATE_SPEECH.forEach(word => {
		if (includesWord(message.content.toLowerCase(), word.toLowerCase())) {
			matchingWords.push(word);
			if (!reasons.includes('hate speech')) reasons.push('hate speech');
		}
	})

	keywords.NSFW.forEach(word => {
		if (includesWord(message.content.toLowerCase(), word.toLowerCase())) {
			matchingWords.push(word);
			if (!reasons.includes('NSFW')) reasons.push('NSFW');
		}
	})

	keywords.RELIGIOUS.forEach(word => {
		if (includesWord(message.content.toLowerCase(), word.toLowerCase())) {
			matchingWords.push(word);
			if (!reasons.includes('Religious')) reasons.push('Religious');
		}
	})

	if (matchingWords.length != 0) {
		var embed = new Discord.MessageEmbed()
			.setAuthor(`${message.author.tag} may have broken the rules`, message.author.displayAvatarURL())
			.setColor(colors.RED)
			.setDescription(
				`[Jump to message](${message.url})\n\n**Keywords**: \`${matchingWords.join(', ')}\`\n**Reasons**: \`${reasons.join(', ')}\`\n**Server**: \`${message.guild}\`\n\n\`\`\`${message.content}\`\`\``
			)
			.setTimestamp()

		client.channels.cache.get('803344583919534091').send(embed)
	}
}

function includesWord(string, word) {
  if (string == word || string.startsWith(word + ' ') || string.endsWith(' ' + word) || string.includes(' ' + word + ' ')) return true
  else return false
}

exports.keywordsDetection = keywordsDetection;