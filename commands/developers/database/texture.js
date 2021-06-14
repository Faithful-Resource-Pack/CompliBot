const Discord        = require('discord.js')
const colors         = require('../../../ressources/colors')
const { errorEmbed } = require('./errorEmbed')
const allCollection  = require('../../../helpers/firestorm/all')

const prefix = process.env.PREFIX

/**
 * Remove a texture corresponding to the given ID
 * @param {String} id texture ID
 * @returns {Discord.MessageEmbed} embed to send
 * 
 * {prefix}db texture delete <id>
 */
async function deleteTexture(id) {

  try {
    await allCollection.texture.get(id)
  } catch (err) { return errorEmbed(`Can't find the texture to delete:\n${err}`) }

  try {
    await allCollection.texture.remove(id)
  } catch (err) { return errorEmbed(err) }

  return new Discord.MessageEmbed().setColor(colors.BLUE).setDescription(`Successfully deleted texture: ${id}\n**Remember, this command doesn't delete children, please make:**\n\`${prefix}db use delete <id>\` & \`${prefix}db path delete <id>\``)
}

/**
 * Create a new texture with provided args
 * @param {String[]} args texture name (optional)
 * @returns {Discord.MessageEmbed} embed to send
 * 
 * {prefix}db texture add <name>
 */
async function addTexture(args) {
  const name = args.join(' ')

  if (name === undefined) return errorEmbed("You need to set up a name")

  let id
  try {
    id = await allCollection.texture.add({
      name: name
    })
  } catch (err) { return errorEmbed(err) }

  return getTexture(id)
}

/**
 * Found & set the value following the given parameters
 * @param {String} id Texture ID
 * @param {String[]} args Array of Strings with parameters
 * @returns {Discord.MessageEmbed} embed to send
 * 
 * {prefix}db texture set <id> name <new name>
 */
async function setTexture(id, args) {
  const parameter = args[0]
  args.splice(0, 1)

  try {
    await allCollection.texture.get(id)
  } catch (err) { return errorEmbed(err) }

  switch (parameter) {
    case "name":

      try {
        await allCollection.texture.set(id, {
          name: args.join(' ')
        })
      } catch(err) { return errorEmbed(err) }
      
      return getTexture(id)

    default:
      return errorEmbed(`There is no \`texture > set > ${parameter}\` parameter`)
  }
}

/**
 * Found & display the texture inside an embed
 * @param {String} id Texture ID
 * @returns {Discord.MessageEmbed} embed to send
 */
async function getTexture(id) {
  let texture
  let uses

  try {
    texture = await allCollection.texture.get(id)
    uses = await texture.uses()
  } catch (err) { return errorEmbed(err) }

  let usesID = uses.map(use => use.id)
  let embed = new Discord.MessageEmbed().setColor(colors.BLUE)

  embed.addFields(
    { name: 'name:', value: texture.name ? texture.name : "None" },
    { name: 'id:', value: texture.id },
    { name: 'uses:', value: usesID.length !== 0 ? `\`${prefix}db use get [${usesID.join('|')}]\`` : `NO USE FOUND, CREATE A NEW ONE USING:\n\`${prefix}db use add <textureID> ...\`` }
  )

  return embed
}

module.exports = {
  deleteTexture,
  addTexture,
  setTexture,
  getTexture
}