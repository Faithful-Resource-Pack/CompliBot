const client = require('../index').Client
const DEV = (process.env.DEV.toLowerCase() == 'true')
const settings = require('../resources/settings')

const { editSubmission }   = require('../functions/textures/submission/editSubmission')
const { manageExtraRoles } = require('../functions/manageExtraRoles')

module.exports = {
  name: 'messageReactionAdd',
  // eslint-disable-next-line no-unused-vars
  async execute(reaction, user) {
    if (DEV) return
    if (user.bot) return
    if (reaction.message.partial) await reaction.message.fetch() // dark magic to fetch message that are sent before the start of the bot

    /**
     * NEW TEXTURE SUBMISSION
     */
    if (
      reaction.message.channel.id === settings.C32_SUBMIT_TEXTURES || // c32x server
      reaction.message.channel.id === settings.C32_SUBMIT_COUNCIL ||
      reaction.message.channel.id === settings.C32_SUBMIT_REVOTE ||
      reaction.message.channel.id === settings.C32_RESULTS ||

      reaction.message.channel.id === settings.C64_SUBMIT_TEXTURES || // c64x server
      reaction.message.channel.id === settings.C64_SUBMIT_COUNCIL ||
      reaction.message.channel.id === settings.C64_SUBMIT_REVOTE ||
      reaction.message.channel.id === settings.C64_RESULTS ||

      reaction.message.channel.id === settings.CDUNGEONS_SUBMIT // dungeons server REMOVE THIS ASAP
    ) editSubmission(client, reaction, user)

    if (reaction.message.channel.id === settings.CEXTRAS_ROLES) manageExtraRoles(client, reaction, user)
  }
}