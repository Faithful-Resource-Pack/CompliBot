const emojis = require('../../../resources/emojis')
const colors = require('../../../resources/colors')

const { getMessages } = require('../../../helpers/getMessages')

/**
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelFromID text-channel from where submission are retrieved
 * @param {String} channelResultsID text-channel where submission are sent (if upvote < downvote || upvote > downvote)
 * @param {String} channelRevotesID text-channel where submission are sent if downvote == upvote
 * @param {Integer} delay delay in day from today
 */
async function councilSubmission(client, channelFromID, channelResultsID, channelRevotesID, delay) {
  let messages = await getMessages(client, channelFromID)
  let channelResults = client.channels.cache.get(channelResultsID)
  let channelRevotes = client.channels.cache.get(channelRevotesID)

  let delayedDate = new Date()
  delayedDate.setDate(delayedDate.getDate() - delay)

  // filter message in the right timezone
  messages = messages.filter(message => {
    let messageDate = new Date(message.createdTimestamp)
    return messageDate.getDate() == delayedDate.getDate() && messageDate.getMonth() == delayedDate.getMonth()
  })

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
  let messagesTied = messages.filter(message => message.upvote == message.downvote)
  let messagesDownvoted = messages.filter(message => message.upvote < message.downvote)

  // send tied message to #revotes (tied)
  messagesTied.forEach(message => {

    channelRevotes.send({ embeds: [message.embed.setColor(colors.RED)] })
      .then(async sentMessage => {
        for (const emojiID of [emojis.UPVOTE, emojis.DOWNVOTE, emojis.SEE_MORE]) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:downvote:${emojis.DOWNVOTE}> Sent to revote!`)
  })

  // send upvoted messages to #results (accepted)
  messagesUpvoted.forEach(message => {
    let embed = message.embed
    embed.setColor(colors.GREEN)
    embed.fields[1].value = `<:upvote:${emojis.UPVOTE}> Will be added in a future version!`

    channelResults.send({ embeds: [embed] })
      .then(async sentMessage => {
        for (const emojiID of [emojis.SEE_MORE]) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:upvote:${emojis.UPVOTE}> Sent to results!`)
  })

  // send upvoted messages to #results (denied)
  messagesDownvoted.forEach(message => {
    let embed = message.embed
    embed.setColor(colors.RED)
    embed.fields[1].value = `<:downvote:${emojis.DOWNVOTE}> After a council decision, this texture is not going to be added, ask them if you want to know more about it.`

    channelResults.send({ embeds: [embed] })
      .then(async sentMessage => {
        for (const emojiID of [emojis.SEE_MORE]) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:upvote:${emojis.UPVOTE}> Sent to results!`)
  })
}

async function editEmbed(message, string) {
  let embed = message.embeds[0]
  embed.fields[1].value = string

  // fix the weird bug that also apply changes to the old embed (wtf)
  embed.setColor(colors.COUNCIL)

  await message.edit({ embeds: [embed] })
}

exports.councilSubmission = councilSubmission