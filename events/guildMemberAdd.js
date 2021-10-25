const client = require('../index').Client
const DEV = (process.env.DEV.toLowerCase() == 'true')
const settings = require('../resources/settings')
const { updateMembers } = require('../functions/moderation/updateMembers')

module.exports = {
  name: 'guildMemberAdd',
  // eslint-disable-next-line no-unused-vars
  async execute(guild) {
    if (DEV) return
    updateMembers(client, settings.C32_ID, settings.C32_COUNTER)
  }
}