module.exports = (client) => {

  const updateMembers = (guild) => {
    if (guild.channels.cache.get !== '720966967325884426') return
    const channel = guild.channels.cache.get('750638888296382504')
    channel.setName(`Member Count: ${guild.memberCount.toLocaleString()}`)
  }

  client.on('guildMemberAdd', (member) => updateMembers(member.guild))
  client.on('guildMemberRemove', (member) => updateMembers(member.guild))

  const guild = client.guilds.cache.get('720966967325884426')
  updateMembers(guild)
}