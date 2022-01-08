
const { MessageEmbed } = require('discord.js');
const lastMessages = require('../functions/lastMessages');

// Environment vars
const DEV = (process.env.DEV.toLowerCase() == 'true')
const LOG_DEV = ((process.env.LOG_DEV.toLowerCase() || 'false') == 'true')

/**
 * @param {Discord.Client} client Discord client treating the information
 * @param {Error|any} reason The object with which the promise was rejected
 * @param {Promise} promise The rejected promise
 * @param {import('discord.js').Message} originMessage Origin user message
 */
module.exports = function(client, reason, promise, originMessage) {
  const settings = require('../resources/settings.json')

	if (DEV) return console.trace(reason.stack || reason)

	const channel = client.channels.cache.get(LOG_DEV ? '875301873316413440' : '853547435782701076')

	let description = `\`\`\`fix\n${reason.stack || JSON.stringify(reason)}\`\`\``
	
	if(originMessage !== undefined && originMessage.url !== undefined) {
		description = 'Coming from [this message](' + originMessage.url + ')\n' + description
	}

	const array = lastMessages.getLastMessages()
	const links = array.map((e,i) => `[Message ${i}](${e})`).join(' ')

	const embed = new MessageEmbed()
		.setTitle('Unhandled Rejection')
		.setDescription(description)
		.setColor(settings.colors.red)
		.addField('Last messages received', links ? links : '*No messages received yet*', false) // Fix bug where embed field value must not be empty
		.setTimestamp()

  console.error(reason, promise)

	channel.send({
		embeds: [embed]
	})
	.catch(console.error) // DO NOT DELETE THIS CATCH, IT AVOIDS INFINITE LOOP IF THIS PROMISE REJECTS
}