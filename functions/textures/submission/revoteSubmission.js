const emojis = require('../../../resources/emojis')
const colors = require('../../../resources/colors')

const { getMessages } = require('../../../helpers/getMessages')

/**
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelFromID text-channel from where submission are retrieved
 * @param {String} channelOutID text-channel where submission are sent
 * @param {Integer} delay delay in day from today
 */
async function revoteSubmission(client, channelFromID, channelOutID, delay) {
  let messages = await getMessages(client, channelFromID)
  let channelOut = client.channels.cache.get(channelOutID)

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
      percentage: null,
      embed: message.embeds[0],
      message: message
    }

    message.percentage = ((message.upvote * 100) / (message.upvote + message.downvote)).toFixed(2)

    return message
  })

  // split messages following their up/down votes (upvote >= downvote -> 66.66 % minimum)
  let messagesUpvoted = messages.filter(message => message.percentage >= 66.66 )
  let messagesDownvoted = messages.filter(message => message.percentage < 66.66 )

  const EMOJIS = [emojis.SEE_MORE]

  // change status message
  messagesDownvoted.forEach(message => {
    let embed = message.embed
    embed.setColor(colors.RED)
    embed.fields[1].value = `<:downvote:${emojis.DOWNVOTE}> After a revote, this texture is not going to be added!\n(${message.percentage}% < 66.66%)`

    channelOut.send({embeds: [embed]})
      .then(async sentMessage => {
        for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:downvote:${emojis.DOWNVOTE}> Not enough upvotes! (${message.percentage}% < 66.66%)`)
  })

  // send message to the output channel & change status
  messagesUpvoted.forEach(message => {
    let embed = message.embed
    embed.setColor(colors.GREEN)
    embed.fields[1].value = `<:upvote:${emojis.UPVOTE}> After a revote, this texture will be added in a future version!\n(${message.percentage}% > 66.66%)`

    channelOut.send({embeds: [embed]})
      .then(async sentMessage => {
        for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:upvote:${emojis.UPVOTE}> Sent to results! (${message.percentage}% > 66.66%)`)
  })
}

async function editEmbed(message, string) {
  let embed = message.embeds[0]
  embed.fields[1].value = string

  // fix the weird bug that also apply changes to the old embed (wtf)
  embed.setColor(colors.RED)

  await message.edit({embeds: [embed]})
}

exports.revoteSubmission = revoteSubmission