/* global process */
const Discord  = require('discord.js')
const settings = require('../settings')
const colors   = require('../res/colors')

/**
 * Quote a message when discord message URL is found
 * @author Juknum
 * @param {DiscordMessage} message
 * @returns Send an embed message with the flagged message content inside
 */
async function quote(msg) {
	const args = msg.content.split(' ')
	let i, ids, embed, file

	// do not quote behave command
	if(args[0].startsWith(process.env.PREFIX + 'behave')) return

	/**
	 * If a new type of URL for discord message is added, add it here
	 */
	for (i = 0; i < args.length; i++) {
		if (args[i].startsWith('https://canary.discord.com/channels/')) {
			ids = new URL(args[i]).pathname.replace('/channels/','').split('/')
			break
		}
		if (args[i].startsWith('https://discord.com/channels/')) {
			ids = new URL(args[i]).pathname.replace('/channels/','').replace('message','').split('/')
			break
		}
		if (args[i].startsWith('https://discordapp.com/channels/')) {
			ids = new URL(args[i]).pathname.replace('/channels/','').split('/')
			break
		}
	}

	if (ids[0] != undefined && msg.guild.id == ids[0]) {
		let channel = msg.guild.channels.cache.get(ids[1])
		let message = await channel.messages.fetch(ids[2])

		if (message.embeds[0] !== undefined) {
			embed = new Discord.MessageEmbed()
				.setColor(colors.BLUE)
				.setDescription(message.embeds[0].description)

			if (message.embeds[0].title != undefined) embed.setTitle(message.embeds[0].title)
			if (message.embeds[0].url != undefined) embed.setURL(message.embeds[0].url)
			
			if (message.embeds[0].author != undefined && !message.embeds[0].author.name.startsWith('Embed posted by')) {
				embed.setThumbnail(message.embeds[0].author.iconURL)
				embed.setAuthor(`Embed sent by ${message.author.tag} (${message.embeds[0].author.name})`, settings.QUOTE_IMG)
			} else {
				embed.setThumbnail(message.author.displayAvatarURL())
				embed.setAuthor(`Embed sent by ${message.author.tag}`, settings.QUOTE_IMG)
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
		
			return await msg.inlineReply(embed)
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

			await msg.inlineReply(embed)
			return
		}
	}
}

exports.quote = quote