const Discord        = require('discord.js')
const colors         = require('../../../resources/colors')
const { errorEmbed } = require('./errorEmbed')
const allCollection  = require('../../../helpers/firestorm/all')

async function setUser(id, args) {
  const parameter = args[0]
  args.splice(0, 1)

  let user
  try {
    user = await allCollection.users.get(id)
  } catch (err) { return errorEmbed(err) }

  switch (parameter) {
    case "type":

      try {
        var arr = JSON.parse(args.join(' '))
      } catch (err) { return errorEmbed(err) }

      if (!Array.isArray(arr))
        return errorEmbed("You must give a JSON Array, not a JSON Object")

      user.type = arr

      try {
        await allCollection.users.set(id, user)
      } catch (err) { return errorEmbed(err) }

      return getUser(id)

    default:
      return errorEmbed(`There is no \`texture > set > ${parameter}\` parameter`)
  }
}

async function addUser() {}

/**
 * Found & display the user inside an embed
 * @param {String} id User ID
 * @returns {Discord.MessageEmbed} embed to send
 */
async function getUser(id) {
  let user

  try {
    user = await allCollection.users.get(id)
  } catch (err) { return errorEmbed(err) }

  let embed = new Discord.MessageEmbed().setColor(colors.BLUE)

  embed.addFields(
    { name: 'username:', value: user.username ? user.username : 'None' },
    { name: 'uuid:',     value: user.uuid },
    { name: 'type:',     value: user.type.length > 0 ? user.type.join(',\n') : 'None' },
    { name: 'id:',       value: user.id },
    { name: 'contributions', value: 'Do `/db user get <user ID> contributions` to see all contributions of that user! (WIP)' }
  )

  return embed
}

async function deleteUser() {}

module.exports = {
  setUser,
  addUser,
  getUser,
  deleteUser
}