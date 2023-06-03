const settings = require('../../../resources/settings.json')

const { getMessages } = require('../../../helpers/getMessages')

/**
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelFromID text-channel from where submission are retrieved
 * @param {String} channelResultsID text-channel where submission are sent
 * @param {Integer} delay delay in day from today
 */
async function councilSubmission(client, channelFromID, channelResultsID, delay) {
  let messages = await getMessages(client, channelFromID)
  let channelResults = client.channels.cache.get(channelResultsID)

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
    .filter(message => message.embeds[0].fields[1] !== undefined && (message.embeds[0].fields[1].value.includes('⏳') || message.embeds[0].fields[1].value.includes(settings.emojis.pending)))

  // map messages adding reacts count, embed and message (easier management like that)
  messages = messages.map(message => {
    message = {
      upvote: message.reactions.cache.get(settings.emojis.upvote).count,
      downvote: message.reactions.cache.get(settings.emojis.downvote).count,
      embed: message.embeds[0],
      message: message
    }

    return message
  })

  // split messages following their up/down votes (upvote >= downvote)
  let messagesUpvoted = messages.filter(message => message.upvote >= message.downvote)
  let messagesDownvoted = messages.filter(message => message.upvote < message.downvote)

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

  // send downvoted messages to #results (denied)
  messagesDownvoted.forEach(message => {
    let embed = message.embed
    embed.setColor(settings.colors.red)
    embed.fields[1].value = `<:downvote:${settings.emojis.downvote}> This texture did not pass council voting and therefore will not be added. Ask an Art Director Council member for more information.`

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
