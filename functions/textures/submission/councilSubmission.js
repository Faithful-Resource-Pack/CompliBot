const emojis = require('../../../ressources/emojis')
const colors = require('../../../ressources/colors')
const { getMessages } = require('../../../helpers/getMessages')

/**
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelFromID text-channel from where submission are retrieved
 * @param {String} channelOutID text-channel where submission are sent
 * @param {String} channelOutID text-channel where submission are sent if downvote >= upvote
 * @param {Integer} delay delay in day from today
 */
async function councilSubmission(client, channelFromID, channelOutID, channelOutInvalidID, delay) {
  let messages = await getMessages(client, channelFromID)
  let channelOut = client.channels.cache.get(channelOutID)
  let channelOutInvalid = client.channels.cache.get(channelOutInvalidID)

  let delayedDate = new Date()
  delayedDate.setDate(delayedDate.getDate() - delay)

  // filter message in the right timezone
  messages = messages.filter(message => {
    let messageDate = new Date(message.createdTimestamp)
    return messageDate.getDate() == delayedDate.getDate() && messageDate.getMonth() == delayedDate.getMonth()
  })

	/**
	 * TRANSITION REMOVE AFTER
	 */

	let oldMessages = messages
		.filter(message => message.embeds.length > 0)
		.filter(message => message.embeds[0].fields[1] !== undefined && message.embeds[0].fields[1].name == 'Folder:')

	for (let i = 0; oldMessages[i]; i++) {
		oldMessages[i] = {
			upvote:   oldMessages[i].reactions.cache.get('⬆️').count,
			downvote: oldMessages[i].reactions.cache.get('⬇️').count,
			embed:    await modifyEmbed(oldMessages[i].embeds[0]),
			message:  oldMessages[i]
		}
	}

	///////////////////////////////////////////////////////////

  // filter message that only have embeds & that have a pending status
  messages = messages
    .filter(message => message.embeds.length > 0)
    .filter(message => message.embeds[0].fields[1] !== undefined && message.embeds[0].fields[1].value.includes('⏳'))

  // map messages adding reacts count, embed and message (easier management like that)
  messages = messages.map(message => {
    message = {
      upvote: message.reactions.cache.get(emojis.UPVOTE).count,
      downvote: message.reactions.cache.get(emojis.DOWNVOTE).count,
      embed: message.embeds[0],
      message: message
    }

    return message
  })

  // split messages following their up/down votes (upvote > downvote)
  let messagesUpvoted = messages.filter(message => message.upvote > message.downvote)
  let messagesDownvoted = messages.filter(message => message.upvote <= message.downvote)


  // change status message
  messagesDownvoted.forEach(message => {
    
    channelOutInvalid.send(
      message.embed
        .setColor(colors.RED)
    )
      .then(async sentMessage => {
        for (const emojiID of [emojis.UPVOTE, emojis.DOWNVOTE, emojis.SEE_MORE]) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:downvote:${emojis.DOWNVOTE}> Sent to revote!`)
  })

  const EMOJIS = [emojis.SEE_MORE]
  // send message to the output channel & change status
  messagesUpvoted.forEach(message => {

    let embed = message.embed
    embed.setColor(colors.GREEN)
    embed.fields[1].value = `<:upvote:${emojis.UPVOTE}> Will be added in a future version!`

    channelOut.send(embed)
      .then(async sentMessage => {
        for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:upvote:${emojis.UPVOTE}> Sent to results!`)
  })

	/** TRANSITION REMOVE AFTER IT */
	let oldMessageUpvoted = oldMessages.filter(message => message.upvote > message.downvote)
  let oldMessageDownvoted = oldMessages.filter(message => message.upvote <= message.downvote)

	oldMessageDownvoted.forEach(message => {
    
    channelOutInvalid.send(
      message.embed
        .setColor(colors.RED)
    )
      .then(async sentMessage => {
        for (const emojiID of [emojis.UPVOTE, emojis.DOWNVOTE, emojis.SEE_MORE]) await sentMessage.react(client.emojis.cache.get(emojiID))
      })
  })

	oldMessageUpvoted.forEach(message => {

    let embed = message.embed
    embed.setColor(colors.GREEN)

		if (embed.title.startsWith('[#???]')) embed.fields[1].value = `❓ Will be added in a future version!`
    else embed.fields[1].value = `<:upvote:${emojis.UPVOTE}> Will be added in a future version!`

    channelOut.send(embed)
      .then(async sentMessage => {
        for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID))
      })
  })

	////////////////////////////////////////////////
}

async function editEmbed(message, string) {
  let embed = message.embeds[0]
  embed.fields[1].value = string

  // fix the weird bug that also apply changes to the old embed (wtf)
  embed.setColor(colors.COUNCIL)

  await message.edit(embed)
}

exports.councilSubmission = councilSubmission

/** REMOVE AFTER TRANSITION */
async function modifyEmbed(embed) {
	const Discord = require('discord.js')

	let newEmbed = new Discord.MessageEmbed()
		.setImage(embed.image.url)
		.setDescription(`${embed.description}.`)
		.addFields(
			{ name: 'Author', value: `<@!340497757410295808>`, inline: true },
			{ name: 'Status', value: '⏳ Pending...', inline: true },
		)

	const textures = require('../../../helpers/firestorm/texture')
	results = await textures.search([{
		field: "name",
		criteria: "==",
		value: embed.fields[0].value
	}])
	
	if (results.length != 0) {
		texture = results[0]

		newEmbed.setTitle(`[#${texture.id}] ${texture.name}`)

		/** @type {import("../../helpers/firestorm/texture_use.js").TextureUse[]} */
		let uses = await texture.uses()
		let pathText = []

		for (let i = 0; uses[i]; i++) {
			let localPath = await uses[i].paths()
			pathText.push(`**${uses[i].editions[0].charAt(0).toUpperCase() + uses[i].editions[0].slice(1)}**`)
			for (let k = 0; localPath[k]; k++) pathText.push(`\`[${localPath[k].versions[localPath[k].versions.length - 1]}+]\` ${localPath[k].path}`)
		}

		newEmbed.addFields({ name: '\u200B', value: pathText, inline: false })
	}
	else {
		newEmbed.setTitle(`[#???] ${embed.fields[0].value}`)
	}

	return newEmbed
}
