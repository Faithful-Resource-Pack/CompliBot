const client = require('../index').Client
const users = require('../helpers/firestorm/users')
const settings = require('../resources/settings.js')
const DEV = (process.env.DEV.toLowerCase() == 'true')

/**
 * This event trigger when a user update: new role, removed role, nickname.
 */
module.exports = {
  name: 'guildMemberUpdate',
  async execute(memberBefore, memberAfter) {
    if (DEV) return

    // if the member isn't on a compliance server, return
    if (!settings.COMPLIANCE_SERVERS_IDS.includes(memberBefore.guild.id)) return 

    console.log(memberBefore)
    const newRole = memberAfter.roles.cache.filter(r => !memberBefore.roles.cache.has(r.id)).first()
    const oldRole = memberBefore.roles.cache.filter(r => !memberAfter.roles.cache.has(r.id)).first()

    let user
    try {
      user = await users.searchKeys([ memberAfter.id ])
      user = user[0]
    } catch (err) { console.error(err) }

    if (!user) {
      user = {
        username: memberAfter.username,
        type: []
      }
    }

    const ROLES = [
      'Administrator',
      'Moderator',
      'Trial Moderator',
      'Previous Staff',
      'Muted',
      'Texture Supervision Council',
      'Developer',
      'VIP',
      'Donator',
      'Contributor',
      'Mods Contributor',
      'Add-on Maker',
      'Translator',
      'Dungeons Contributor',
    ]

    // a role is added to someone
    if (newRole && !oldRole) {
      if (ROLES.includes(newRole.name) && !user.type.includes(newRole.name)) user.type.push(newRole.name)
    }

    // a role is removed to someone
    if (oldRole && !newRole) {
      if (ROLES.includes(oldRole.name) && user.type.includes(oldRole.name)) user.type = user.type.filter(t => t !== oldRole.name)
    }

    // update role on all compliance server
    if ((oldRole && oldRole.name !== 'Muted') || (newRole && newRole.name !== 'Muted')) {
      for (let i = 0; i < settings.COMPLIANCE_SERVERS_IDS.length; i++) {
        let server = await client.guilds.cache.get(settings.COMPLIANCE_SERVERS_IDS[i]) || undefined
        let member = server === undefined ? undefined : await server.members.cache.get(memberAfter.id) || undefined
        let role = member === undefined ? undefined : await server.roles.cache.find(r => r.name === (oldRole ? oldRole.name : newRole.name))

        if ((oldRole && !newRole) && role) await member.roles.remove(role).catch(() => {})
        else if ((newRole && !oldRole) && role) await member.roles.add(role).catch(() => {})
      }
    }

    users.set(memberAfter.id, user)
  }
}