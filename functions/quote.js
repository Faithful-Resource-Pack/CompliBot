const Discord = require('discord.js')
const settings = require('../resources/settings')
const colors = require('../resources/colors')

const { addDeleteReact } = require('../helpers/addDeleteReact')

/**
 * Quote a message when discord message URL is found
 * @author Juknum
 * @param {DiscordMessage} message
 * @returns Send an embed message with the flagged message content inside
 */
async function quote(msg) {
	const args = msg.content.split(' ')
	let i, ids, embed, file

	// no private messages
	if (msg.channel.type === 'DM') return

	// cancel if quote is in texture submission channel
	if (
		msg.channel.id === settings.C32_SUBMIT_TEXTURES ||
		msg.channel.id === settings.C64_SUBMIT_TEXTURES ||
		msg.channel.id === settings.CDUNGEONS_SUBMIT
	) return

	// do not quote behave command
	if (args[0].startsWith(process.env.PREFIX + 'behave')) return

	// regex tests here https://regex101.com/r/1cIYqf/1/
	// This fixes bugs with incorrect body messages with no space or incorrect match
	const regex = /https:\/\/(canary\.)?discord(app)?\.com\/channels\/([0-9]+)\/([0-9]+)\/([0-9]+)/g
	const str = args.join(' ')

	let matches = regex.exec(str)

	// no message match
	if (matches === null) return

	// group 3 for guild, group 4 for channel, group 5 for message
	ids = [matches[3], matches[4], matches[5]]

	if (ids[0] != undefined && msg.guild.id == ids[0]) {
		let channel = msg.guild.channels.cache.get(ids[1])
		let message = await channel.messages.fetch(ids[2])

		if (message.embeds[0] !== undefined) {
			embed = new Discord.MessageEmbed()
				.setColor(colors.BLUE)

			if (message.embeds[0].description && typeof (message.embeds[0].description) === 'string') // fixes bug "MessageEmbed description must be a string."
				embed.setDescription(message.embeds[0].description)

			if (message.embeds[0].title != undefined) embed.setTitle(message.embeds[0].title)
			if (message.embeds[0].url != undefined) embed.setURL(message.embeds[0].url)

			if (message.embeds[0].author != undefined && !message.embeds[0].author.name.startsWith('Embed posted by')) {
				embed.setThumbnail(settings.QUOTE_IMG)
				embed.setAuthor(`Embed sent by ${message.author.tag} (${message.embeds[0].author.name})`, message.embeds[0].author.iconURL)
			} else {
				embed.setThumbnail(settings.QUOTE_IMG)
				embed.setAuthor(`Embed sent by ${message.author.tag}`, message.author.displayAvatarURL())
			}

			if (message.embeds[0].fields != undefined) {
				for (i = 0; i < message.embeds[0].fields.length; i++) {
					embed.addFields({ name: message.embeds[0].fields[i].name, value: message.embeds[0].fields[i].value, inline: true })
				}
			}

			if (message.embeds[0].image) {
				embed.setImage(message.embeds[0].image.url)
			}

			if (message.attachments.size > 0 && message.embeds[0].image == undefined) {
				file = message.attachments.first().url
				if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('jpeg')) embed.setImage(file)
			}

			return await msg.reply({ embeds: [embed] })
		}

		else {
			embed = new Discord.MessageEmbed()
				.setColor(colors.BLUE)
				.setAuthor(`Message sent by ${message.author.tag}`, settings.QUOTE_IMG)
				.setThumbnail(message.author.displayAvatarURL())
				.setDescription(message.content)
				.setFooter(`Quoted by ${msg.author.tag}`, msg.author.displayAvatarURL())

			if (message.attachments.size > 0) {
				file = message.attachments.first().url
				if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('jpeg')) embed.setImage(file)
			}
			else {
				const messageArgs = message.content.split(' ')
				for (i = 0; i < messageArgs.length; i++) {
					if (messageArgs[i].startsWith('https://') && (messageArgs[i].endsWith('.gif') || messageArgs[i].endsWith('.gif?'))) {
						embed.setImage(messageArgs[i])
						embed.setDescription(message.content.replace(messageArgs[i], ''))
						break
					}
				}
			}

			const embedMessage = await msg.reply({ embeds: [embed] })
			addDeleteReact(embedMessage, msg)
		}
	}
}

exports.quote = quote