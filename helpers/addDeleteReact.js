const emojis = require('../ressources/emojis')

/**
 * Add a trash can emote and await it, if used, the authorMessage is deleted, does nothing if sentMessage is in DM
 * @param {DiscordMessage} sentMessage message sent by the bot
 * @param {DiscordMessage} authorMessage message the bot has respond to
 */
async function addDeleteReact(sentMessage, authorMessage) {
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
    }
  })
  .catch(async () => {
    if (!sentMessage.deleted) await sentMessage.reactions.cache.get(emojis.DELETE).remove()
  })
}

exports.addDeleteReact = addDeleteReact