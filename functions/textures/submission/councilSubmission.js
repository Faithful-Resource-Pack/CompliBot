const settings = require('../../../resources/settings.json')

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
      /* uncomment below code on the 11/12/2021 after the submission functions executed (use "[#1425] cod" texture for orientation)
      upvote: message.reactions.cache.get(settings.emojis.upvote).count,
      downvote: message.reactions.cache.get(settings.emojis.downvote).count,
      uncomment above code with conditions above

      remove below code with conditions above */
      upvote: message.reactions.cache.get(settings.emojis.upvote_old).count,
      downvote: message.reactions.cache.get(settings.emojis.downvote_old).count,
      // remove above code with conditions above
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

    channelRevotes.send({ embeds: [message.embed.setColor(settings.colors.red)] })
      .then(async sentMessage => {
        for (const emojiID of [settings.emojis.upvote, settings.emojis.downvote, settings.emojis.see_more]) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:downvote:${settings.emojis.downvote}> Sent to revote!`)
  })

  // send upvoted messages to #results (accepted)
  messagesUpvoted.forEach(message => {
    let embed = message.embed
    embed.setColor(settings.colors.green)
    embed.fields[1].value = `<:upvote:${settings.emojis.upvote}> Will be added in a future version!`

    channelResults.send({ embeds: [embed] })
      .then(async sentMessage => {
        for (const emojiID of [settings.emojis.see_more]) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:upvote:${settings.emojis.upvote}> Sent to results!`)
  })

  // send upvoted messages to #results (denied)
  messagesDownvoted.forEach(message => {
    let embed = message.embed
    embed.setColor(settings.colors.red)
    embed.fields[1].value = `<:downvote:${settings.emojis.downvote}> After a council decision, this texture is not going to be added, ask them if you want to know more about it.`

    channelResults.send({ embeds: [embed] })
      .then(async sentMessage => {
        for (const emojiID of [settings.emojis.see_more]) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:upvote:${settings.emojis.upvote}> Sent to results!`)
  })
}

async function editEmbed(message, string) {
  let embed = message.embeds[0]
  embed.fields[1].value = string

  // fix the weird bug that also apply changes to the old embed (wtf)
  embed.setColor(settings.colors.council)

  await message.edit({ embeds: [embed] })
}

exports.councilSubmission = councilSubmission