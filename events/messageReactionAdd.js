const client = require('../index').Client
const DEV = (process.env.DEV.toLowerCase() == 'true')
const settings = require('../resources/settings')

const { editSubmission }   = require('../functions/textures/submission/editSubmission')
const { manageExtraRoles } = require('../functions/manageExtraRoles')

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (DEV) return
    if (user.bot) return
    if (reaction.message.partial) await reaction.message.fetch() // dark magic to fetch message that are sent before the start of the bot

    switch (reaction.message.channel.id) {
      // TEXTURES SUBMISSIONS
      case settings.C32_SUBMIT_TEXTURES:
      case settings.C32_SUBMIT_COUNCIL:
      case settings.C32_SUBMIT_REVOTE:
      case settings.C32_RESULTS:
      case settings.C64_SUBMIT_TEXTURES:
      case settings.C64_SUBMIT_COUNCIL:
      case settings.C64_SUBMIT_REVOTE:
      case settings.C64_RESULTS:
        editSubmission(client, reaction, user)
        break;
      
      // EXTRA ROLES MANAGER
      case settings.CEXTRAS_ROLES:
        manageExtraRoles(client, reaction, user)
        break;
      
      // Not setup
      default:
        break;
    }
  }
}