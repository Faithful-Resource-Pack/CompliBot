const settings = require('../../../resources/settings.json')
const allCollection = require('../../../helpers/firestorm/all')

const { MessageEmbed } = require('discord.js')
const { errorEmbed } = require('./errorEmbed')

const prefix = process.env.PREFIX
const EDITIONS = ["bedrock", "java"]

/**
 * Remove a use corresponding to the given ID
 * @param {String} id use ID
 * @returns {Discord.MessageEmbed} embed to send
 */
async function deleteUse(id) {
  try {
    await allCollection.texture_use.get(id)
  } catch (err) { return errorEmbed(`Can't find the use to delete:\n${err}`) }

  try {
    await allCollection.texture_use.remove(id)
  } catch (err) { return errorEmbed(err) }

  return new MessageEmbed().setColor(settings.colors.blue).setDescription(`Successfully deleted use: ${id}\n**Remember, this command doesn't delete children, please make:**\n\`${prefix}db path delete <id>\``)
}

/**
 * Create a new use to the given texture
 * @param {String} id textureID
 * @param {String[]} args optional args
 * @returns {Discord.MessageEmbed} embed to send
 * 
 * ${prefix}db use add <textureID> <{textureUseName: String, editions: String[]}>
 */
async function addUse(textureID, args) {
  let texture
  try {
    texture = await allCollection.texture.get(textureID)
  } catch (err) { return errorEmbed(`Can't find the given texture:\n${err}`) }

  let uses = await texture.uses()

  /**
   * TODO: if a there is more than 26 use, the 27th one should be named <id>aa then <id>ab ... <id>zz etc.. (<id>aaaaaaaaa could be a thing :eyes:)
   * (not urgent)
   */
  const SUFFIX = settings.uses.suffix
  const id = textureID + SUFFIX[uses.length]

  if (args.length > 0) {
    try {
      var obj = JSON.parse(args.join(' '))
    } catch (err) { return errorEmbed(err) }

    if (Array.isArray(obj))
      return errorEmbed("You must give a JSON Object, not a JSON Array")
    if (obj.textureUseName === undefined || obj.editions === undefined)
      return errorEmbed("One of the value was not setup, full object:\n { textureUseName: String, editions: String[] }")
    else if (obj.textureUseName instanceof String)
      return errorEmbed("textureUseName does not use the right type, full object:\n { textureID: String, textureUseName: String, editions: String[] }")
    else if (!Array.isArray(obj.editions) || obj.editions.length === 0)
      return errorEmbed("editions is not an Array OR the Array is empty, full object:\n { textureID: String, textureUseName: String, editions: String[] }")

    var i = 0
    while (i < obj.editions.length && typeof (obj.editions[i]) === 'string' && EDITIONS.includes(obj.editions[i])) { i++ }
    if (obj.editions.length !== i)
      return errorEmbed("editions is not an Array of String, full object:\n { textureID: Number, textureUseName: String, editions: String[] }")

    try {
      await allCollection.texture_use.set(id, {
        textureID: textureID,
        textureUseName: "",
        editions: obj.editions
      })
    } catch (err) { return errorEmbed(err) }
  }
  else return errorEmbed('You did not provide the required JSON Object')

  return getUse(id)
}

/**
 * Found & set the value following the given parameters
 * @param {String} id Texture ID
 * @param {String[]} args Array of Strings with parameters
 * @returns {Discord.MessageEmbed} embed to send
 * 
 * {prefix}db use set <id> full <JSON Object>
 * {prefix}db use set <id> textureID <textureID>
 * {prefix}db use set <id> textureUseName <name>
 */
async function setUse(id, args) {
  const parameter = args[0]
  args.splice(0, 1)

  let use
  try {
    use = await allCollection.texture_use.get(id)
  } catch (err) { return errorEmbed(err) }

  switch (parameter) {
    case "full":
      try {
        var obj = JSON.parse(args.join(' '))
      } catch (err) { return errorEmbed(err) }

      if (Array.isArray(obj))
        return errorEmbed("You must give a JSON Object, not a JSON Array")
      if (obj.textureID === undefined || obj.textureUseName === undefined || obj.editions === undefined)
        return errorEmbed("One of the value was not setup, full object:\n { textureID: Number, textureUseName: String, editions: String[] }")

      if (obj.textureID instanceof String)
        return errorEmbed("textureID does not use the right type, full object:\n { textureID: Number, textureUseName: String, editions: String[] }")
      else if (obj.textureUseName instanceof String)
        return errorEmbed("textureUseName does not use the right type, full object:\n { textureID: Number, textureUseName: String, editions: String[] }")
      else if (!Array.isArray(obj.editions) || obj.editions.length === 0)
        return errorEmbed("editions is not an Array OR the Array is empty, full object:\n { textureID: Number, textureUseName: String, editions: String[] }")

      var i = 0
      while (i < obj.editions.length && typeof (obj.editions[i]) === 'string' && EDITIONS.includes(obj.editions[i])) { i++ }
      if (obj.editions.length !== i)
        return errorEmbed("editions is not an Array of String, full object:\n { textureID: Number, textureUseName: String, editions: String[] }")

      try {
        await allCollection.texture_use.set(id, {
          textureID: obj.textureID,
          textureUseName: obj.textureUseName,
          editions: obj.editions
        })
      } catch (err) { return errorEmbed(err) }

      return getUse(id)

    case "textureID":
      use.textureID = parseInt(args[0], 10)
      try {
        await allCollection.texture_use.set(id, use)
      } catch (err) { return errorEmbed(err) }

      return getUse(id)

    case "textureUseName":
      use.textureUseName = args[0]
      try {
        await allCollection.texture_use.set(id, use)
      } catch (err) { return errorEmbed(err) }

      return getUse(id)

    case "editions":

      try {
        var arr = JSON.parse(args.join(' '))
      } catch (err) { return errorEmbed(err) }

      if (arr[0] === undefined)
        return errorEmbed("You can't set an empty array")

      use.editions = arr
      try {
        await allCollection.texture_use.set(id, use)
      } catch (err) { return errorEmbed(err) }

      return getUse(id)

    default:
      return errorEmbed(`There is no \`texture > set > ${parameter}\` parameter`)
  }
}

/**
 * Found & display the texture inside an embed
 * @param {String} id Texture ID
 * @returns {Discord.MessageEmbed} embed to send
 */
async function getUse(id) {
  let use
  let paths

  try {
    use = await allCollection.texture_use.get(id)
    paths = await use.paths()
  } catch (err) { return errorEmbed(err) }

  let pathsID = paths.map(use => use.id)
  let embed = new MessageEmbed().setColor(settings.colors.blue)

  embed.addFields(
    { name: 'textureUseName', value: use.textureUseName != "" ? use.textureUseName : 'None' },
    { name: 'textureID', value: use.textureID },
    { name: 'editions', value: use.editions[0] ? use.editions : 'None' },
    { name: 'id', value: use.id },
    { name: 'paths:', value: pathsID.length !== 0 ? `\`${prefix}db path get [${pathsID.join('|')}]\`` : `NO PATH FOUND, CREATE A NEW ONE USING:\n\`${prefix}db path add <useID> ...\`` }
  )

  return embed
}

module.exports = {
  deleteUse,
  addUse,
  setUse,
  getUse
}