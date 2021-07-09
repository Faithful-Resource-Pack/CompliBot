const emojis = require('../resources/emojis')

/**
 * Add a trash can emote and await it, if used, the authorMessage is deleted, does nothing if sentMessage is in DM
 * @param {DiscordMessage} sentMessage message sent by the bot
 * @param {DiscordMessage} authorMessage message the bot has respond to
 */
async function addDeleteReact(sentMessage, authorMessage, deleteAuthorMessage = false) {
  if (sentMessage.channel.type === 'dm') return

  await sentMessage.react(emojis.DELETE)

  const filter = (reaction, user) => {
    return [emojis.DELETE].includes(reaction.emoji.id) && user.id === authorMessage.author.id
  }

  sentMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
  .then(async collected => {
    const reaction = collected.first()
    if (reaction.emoji.id === emojis.DELETE) {
      await sentMessage.delete()
      if (deleteAuthorMessage == true && !authorMessage.deleted) await authorMessage.delete()
    }
  })
  .catch(async () => {
    if (!sentMessage.deleted) {
      const deleteReaction = sentMessage.reactions.cache.get(emojis.DELETE)
      if(deleteReaction !== undefined) deleteReaction.remove() // FIX for undefined delete reaction remove
    }
  })
}

exports.addDeleteReact = addDeleteReact