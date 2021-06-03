/* eslint-disable no-irregular-whitespace */
const prefix  = process.env.PREFIX

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT

const strings = require('../../../ressources/strings')
const { warnUser } = require('../../../helpers/warnUser')

const { setUse, addUse, getUse, deleteUse } = require('./use')
const { setTexture, addTexture, getTexture, deleteTexture } = require('./texture')
const { setPath, addPath, getPath, deletePath } = require('./path')
const { errorEmbed } = require('./errorEmbed')


module.exports = {
  name: 'database',
  aliases: ['db'],
  description: 'Fix or modify database textures directly from the bot',
  guildOnly: false,
  uses: strings.COMMAND_USES_DEVS,
  syntax: `${prefix}db [texture|use|path] <get|set|add|delete/remove> <id> <parameters (see examples)>`,
  args: true,
  example: `
${prefix}db texture get <texture id>
${prefix}db texture set <texture id> name <name>
${prefix}db texture add <name>
${prefix}db texture remove|delete <texture id>

${prefix}db use get <use id>
${prefix}db use set <use id> full <{textureID: Number, textureUseName: String, editions: String[]}>
${prefix}db use set <use id> textureID <textureID>
${prefix}db use set <use id> textureUseName <name>
${prefix}db use add <texture id> <{textureUseName: String, editions: String[]}>
${prefix}db use remove|delete <use id>

${prefix}db path get <path id>
${prefix}db path set <path id> full <{useID: String, path: String, versions: String[]}>
${prefix}db path set <path id> useID <use ID>
${prefix}db path set <path id> path <path>
${prefix}db path set <path id> editions <[ "1.17", "1.16.5" ]>
${prefix}db path add <useID> <{path: String, versions: String[]}>
${prefix}db path remove|delete <path id>`,
  async execute(_client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {
      
      const type = args[0]
      const operation = args[1]
      const id = args[2]
      let embed

      switch (type) {
        case "texture":
          switch (operation) {
            case "get":
              embed = await getTexture(id)
              break
            case "set":
              embed = await setTexture(id, args.slice(3))
              break
            case "add":
              embed = await addTexture(args.slice(2))
              break

            case "remove":
            case "delete":
              embed = await deleteTexture(id)
              break

            default:
              embed = await errorEmbed(`\`${type} > ${operation}\` does not exist.`)
              break
          }
          break

        case "use":
          switch (operation) {
            case "get":
              embed = await getUse(id)
              break
            case "set":
              embed = await setUse(id, args.slice(3))
              break

            case "add":
              embed = await addUse(id, args.slice(3))
              break

            case "remove":
            case "delete":
              embed = await deleteUse(id)
              break

            default:
              embed = await errorEmbed(`\`${type} > ${operation}\` does not exist.`)
              break
          }
          break;
        case "path":
          switch (operation) {
            case "get":
              embed = await getPath(id)
              break

            case "set":
              embed = await setPath(id, args.slice(3))
              break

            case "add":
              embed = await addPath(id, args.slice(3))
              break

            case "remove":
            case "delete":
              embed = await deletePath(id)
              break

            default:
              embed = await errorEmbed(`\`${type} > ${operation}\` does not exist`)
              break
          }
          break
        default:
          embed = await errorEmbed(`\`${type}\` does not exist`)
          break
      }
      
      if (embed === undefined) embed = await errorEmbed('AN ERROR OCCURED')
      message.inlineReply(embed)

    } else return warnUser(message, strings.COMMAND_NO_PERMISSION)
  }
}