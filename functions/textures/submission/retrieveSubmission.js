const emojis = require('../../../ressources/emojis')
const colors = require('../../../ressources/colors')
const { getMessages } = require('../../../helpers/getMessages')

/**
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelFromID text-channel from where submission are retrieved
 * @param {String} channelOutID text-channel where submission are sent
 * @param {Integer} delay delay in day from today
 */
async function retrieveSubmission(client, channelFromID, channelOutID, delay) {
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
      upvote: message.reactions.cache.get(emojis.UPVOTE).count + message.reactions.cache.get(emojis.UPVOTE_OLD),
      downvote: message.reactions.cache.get(emojis.DOWNVOTE).count + message.reactions.cache.get(emojis.DOWNVOTE_OLD),
      embed: message.embeds[0],
      message: message
    }

    return message
  })

  // split messages following their up/down votes (upvote >= downvote)
  let messagesUpvoted = messages.filter(message => message.upvote >= message.downvote)
  let messagesDownvoted = messages.filter(message => message.upvote < message.downvote)

  // change status message
  messagesDownvoted.forEach(message => {
    editEmbed(message.message, `<:downvote:${emojis.DOWNVOTE}> Not enough upvotes!`)
  })

  // send message to the output channel & change status
  const EMOJIS = [emojis.UPVOTE, emojis.DOWNVOTE, emojis.SEE_MORE]
  messagesUpvoted.forEach(message => {
    channelOut.send(
      message.embed
        .setColor(colors.COUNCIL)
        .setDescription(`[Original Post](${message.message.url})\n${message.embed.description ? message.embed.description : ''}`)
    )
      .then(async sentMessage => {
        for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID))
      })

    editEmbed(message.message, `<:upvote:${emojis.UPVOTE}> Sent to Council!`)
  })
}

async function editEmbed(message, string) {
  let embed = message.embeds[0]
  embed.fields[1].value = string

  // fix the weird bug that also apply changes to the old embed (wtf)
  embed.setColor(colors.BLUE)
  if (embed.description !== null) embed.setDescription(message.embeds[0].description.replace(`[Original Post](${message.url})\n`, ''))

  await message.edit(embed)
}

exports.retrieveSubmission = retrieveSubmission