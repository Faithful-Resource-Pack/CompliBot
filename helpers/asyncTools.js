module.exports = {
  /**
   * 
   * @param {import('discord.js').Message} message Message to react to
   * @param {String|String[]} reactions Ractions characters to add
   */
  async react(message, reactions) {
    if(message === undefined || reactions === undefined) // FIX for unknow react on undefined
      return

    if(typeof(reactions) === 'string') // FIX for reactions are not iterable (happens when 1 reaction only given)
      reactions = [reactions]

    if(!Array.isArray(reactions))
      throw new Error('Reactions are not an array')

    // be strict about type
    let i = 0
    while(i < reactions.length) {
      if(typeof(reactions[i]) !== 'string')
        throw new Error('Incorrect array value, only strings accepted, got' + reactions.toString())
      ++i
    }
    
    let hasBeenDeleted
    for (const reaction of reactions) {
      hasBeenDeleted = await (message.react(reaction).then(() => { return false }).catch(() => { return true }))

      if(hasBeenDeleted) return
    }
  }
}