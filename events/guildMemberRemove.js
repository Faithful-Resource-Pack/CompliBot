const client = require('../index').Client
const DEV = (process.env.DEV.toLowerCase() == 'true')
const settings = require('../resources/settings.json')
const { updateMembers } = require('../functions/moderation/updateMembers')

module.exports = {
  name: 'guildMemberRemove',
  // eslint-disable-next-line no-unused-vars
  async execute(guild) {
    if (DEV) return
    updateMembers(client, settings.guilds.c32.id, settings.channels.counters.c32)
    updateMembers(client, '814198513847631944', '814246773459255328')
  }
}