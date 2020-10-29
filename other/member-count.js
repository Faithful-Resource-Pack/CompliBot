module.exports = (client) => {

  const updateMembers = (guild) => {
    const channel = guild.channels.cache.get('750638888296382504')
    channel.setName(`Members: ${guild.memberCount.toLocaleString()}`)
  }

  client.on('guildMemberAdd', (member) => updateMembers(member.guild))
  client.on('guildMemberRemove', (member) => updateMembers(member.guild))

  const guild = client.guilds.cache.get('720966967325884426')
  updateMembers(guild)
}