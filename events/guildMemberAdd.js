const client = require('../index').Client
const DEV = (process.env.DEV.toLowerCase() == 'true')
const settings = require('../resources/settings.json')
const { updateMembers } = require('../functions/moderation/updateMembers')

module.exports = {
  name: 'guildMemberAdd',
  // eslint-disable-next-line no-unused-vars
  async execute(guild) {
    if (DEV) return
    updateMembers(client, settings.guilds.c32.id, settings.channels.counters.c32)
  }
}