const client = require('../index').Client
const DEV = (process.env.DEV.toLowerCase() == 'true')
const DEV_REACTION = (process.env.DEV_REACTION || false) == 'true'
const settings = require('../resources/settings.json')

const { editSubmission } = require('../functions/textures/submission/editSubmission')
const { manageExtraRoles } = require('../functions/manageExtraRoles')

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (DEV) return
    if (user.bot) return
    if (reaction.message.partial) await reaction.message.fetch() // dark magic to fetch message that are sent before the start of the bot

    switch (reaction.message.channel.id) {
      // TEXTURES SUBMISSIONS
      case settings.channels.submit_textures.c32:
      case settings.channels.submit_council.c32:
      case settings.channels.submit_revote.c32:
      case settings.channels.submit_results.c32:
      case settings.channels.submit_textures.c64:
      case settings.channels.submit_council.c64:
      case settings.channels.submit_revote.c64:
      case settings.channels.submit_results.c64:
      case settings.channels.submit_council.dev:
        if (reaction.message.channel.id === settings.channels.submit_council.dev && !DEV_REACTION) return
        editSubmission(client, reaction, user)
        break;

      // EXTRA ROLES MANAGER
      case settings.channels.cextras_roles:
        manageExtraRoles(client, reaction, user)
        break;

      // Not setup
      default:
        break;
    }
  }
}