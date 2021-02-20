module.exports = {
  async react(message, reactions) {
    let hasBeenDeleted = false
    for (const reaction of reactions) {
      if (!hasBeenDeleted) {
        await message.react(reaction).catch(() => {
          hasBeenDeleted = true
        })
      } else {
        return
      }
    }
  }
}