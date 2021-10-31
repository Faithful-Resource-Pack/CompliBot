const Discord = require('discord.js')
const settings = require('../../../resources/settings.json')
const { errorEmbed } = require('./errorEmbed')
const allCollection = require('../../../helpers/firestorm/all')

/**
 * Delete path with the given id
 * @param {String} id path ID
 * @returns {Discord.MessageEmbed} embed to send
 */
async function deletePath(id) {
  try {
    await allCollection.texture_path.get(id)
  } catch (err) { return errorEmbed(`Can't find the path to delete:\n${err}`) }

  try {
    await allCollection.texture_path.remove(id)
  } catch (err) { return errorEmbed(err) }

  return new Discord.MessageEmbed().setColor(settings.colors.blue).setDescription(`Successfully deleted path: ${id}`)
}

/**
 * Create a new path attached to the given useID & with provided JSON
 * @param {String} useID 
 * @returns {Discord.MessageEmbed} embed to send
 * 
 * ${prefix}db path add <useID> <{path: String, versions: String[]}>
 */
async function addPath(useID, args) {
  try {
    await allCollection.texture_use.get(useID)
  } catch (err) { return errorEmbed(`Can't find the given use:\n${err}`) }

  if (args.length > 0) {
    try {
      var obj = JSON.parse(args.join(' '))
    } catch (err) { return errorEmbed(err) }

    if (Array.isArray(obj))
      return errorEmbed("You must give a JSON Object, not a JSON Array")
    if (obj.path === undefined || obj.versions === undefined)
      return errorEmbed("One of the value was not setup, full object:\n { useID: String, path: String, versions: String[] }")
    else if (!Array.isArray(obj.versions) || obj.versions.length === 0)
      return errorEmbed("versions is not an Array OR the Array is empty, full object:\n { useID: String, path: String, versions: String[] }")

    var i = 0
    while (i < obj.versions.length && typeof (obj.versions[i]) === 'string') { i++ }
    if (obj.versions.length !== i)
      return errorEmbed("versions is not an Array of String, full object:\n { useID: String, path: String, versions: String[] }")

    var id
    try {
      id = await allCollection.texture_path.add({
        useID: useID,
        path: obj.path,
        versions: obj.versions
      })
    } catch (err) { return errorEmbed(err) }

    return getPath(id)
  }
  else return errorEmbed('You did not provide the required JSON Object')
}

/**
 * Set given value to the given path using given id
 * @param {String} id 
 * @param {String[]} args 
 * @returns {Discord.MessageEmbed} embed to send
 * 
 * ${prefix}db path set <path id> full <{useID: String, path: String, versions: String[]}>
 * ${prefix}db path set <path id> useID <use ID>
 * ${prefix}db path set <path id> path <path>
 * ${prefix}db path set <path id> editions <[ "1.17", "1.16.5" ]>
 */
async function setPath(id, args) {
  const parameter = args[0]
  args.splice(0, 1)

  let path

  try {
    path = await allCollection.texture_path.get(id)
  } catch (err) { return errorEmbed(err) }

  switch (parameter) {
    case "full":

      try {
        var obj = JSON.parse(args.join(' '))
      } catch (err) { return errorEmbed(err) }

      if (Array.isArray(obj))
        return errorEmbed("You must give a JSON Object, not a JSON Array")
      if (obj.useID === undefined || obj.path === undefined || obj.versions === undefined)
        return errorEmbed("One of the value was not setup, full object:\n { useID: Number, path: String, versions: String[] }")

      if (obj.useID instanceof String)
        return errorEmbed("useID does not use the right type, full object:\n { useID: Number, path: String, versions: String[] }")
      else if (obj.path instanceof String)
        return errorEmbed("path does not use the right type, full object:\n { useID: Number, path: String, versions: String[] }")
      else if (!Array.isArray(obj.versions) || obj.versions.length === 0)
        return errorEmbed("versions is not an Array OR the Array is empty, full object:\n { useID: Number, path: String, versions: String[] }")

      var i = 0
      while (i < obj.versions.length && typeof (obj.versions[i]) === 'string') { i++ }
      if (obj.versions.length !== i)
        return errorEmbed("versions is not an Array of String, full object:\n { useID: Number, path: String, versions: String[] }")

      try {
        await allCollection.texture_path.set(id, {
          useID: obj.useID,
          path: obj.path,
          versions: obj.versions
        })
      } catch (err) { return errorEmbed(err) }

      return getPath(id)
    case "useID":
      path.useID = args[0]

      try {
        await allCollection.texture_path.set(id, path)
      } catch (err) { return errorEmbed(err) }

      return getPath(id)
    case "path":

      path.path = args[0]

      try {
        await allCollection.texture_path.set(id, path)
      } catch (err) { return errorEmbed(err) }

      break
    case "versions":

      try {
        var arr = JSON.parse(args.join(' '))
      } catch (err) { return errorEmbed(err) }

      if (!Array.isArray(arr))
        return errorEmbed("You must give a JSON Array, not a JSON Object")

      var k = 0
      while (k < arr.length && typeof arr[k] === 'string') { k++ }
      if (arr.length !== k)
        return errorEmbed("The provided Array does not follow requirement, example: [ \"MC VERSION\" ] (array of string only)")

      path.versions = arr

      try {
        await allCollection.texture_path.set(id, path)
      } catch (err) { return errorEmbed(err) }

      return getPath(id)
    default:
      return errorEmbed(`There is no \`path > set > ${parameter}\` parameter`)
  }

  return getPath(id)
}

/**
 * Found & display the path inside an embed
 * @param {String} id Path ID
 * @returns {Discord.MessageEmbed} embed to send
 * 
 * ${prefix}db path get <id>
 */
async function getPath(id) {
  let path

  try {
    path = await allCollection.texture_path.get(id)
  } catch (err) { return errorEmbed(err) }

  let embed = new Discord.MessageEmbed().setColor(settings.colors.blue)
  embed.addFields(
    { name: "useID", value: path.useID },
    { name: "path", value: path.path },
    { name: "versions", value: path.versions },
    { name: "id", value: path.id }
  )

  return embed
}

module.exports = {
  deletePath,
  addPath,
  setPath,
  getPath
}