
const Discord = require('discord.js')

// Environment vars
const DEV = (process.env.DEV.toLowerCase() == 'true')
const LOG_DEV = ((process.env.LOG_DEV.toLowerCase() || 'false') == 'true')

/**
 * @param {Discord.Client} client Discord client treating the information
 * @param {Error|any} reason The object with which the promise was rejected
 * @param {Promise} promise The rejected promise
 */
module.exports = function(client, reason, promise) {
  const settings = require('./resources/settings.json')

	if (DEV) return console.trace(reason.stack || reason)

	const channel = client.channels.cache.get(LOG_DEV ? '875301873316413440' : '853547435782701076')
	const embed = new Discord.MessageEmbed()
		.setTitle('Unhandled Rejection')
		.setDescription(`\`\`\`fix\n${reason.stack || JSON.stringify(reason)}\`\`\``)
		.setColor(settings.colors.red)
		.setTimestamp()

  console.error(reason, promise)

	channel.send({ embeds: [embed] })
}