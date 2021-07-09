/* eslint-disable no-irregular-whitespace */
const prefix = process.env.PREFIX;

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const Discord = require('discord.js');
const colors  = require('../../resources/colors');
const strings = require('../../resources/strings');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
  name: 'users',
  aliases: ['user'],
  description: 'Fix or modify users elements directly from the bot',
  guildOnly: false,
  uses: strings.COMMAND_USES_DEVS,
  syntax: `${prefix}users <set> <id> <field> <value>\n${prefix}user <delete> <id>\n${prefix}user <add> <id> [username]`,
  args: true,
  example: `${prefix}user delete <id>\n${prefix}user add <id> RoBoT\n${prefix}user set <id> username Steve\n${prefix}user set <id> type [ "member", ... ]\n${prefix}user set <id> warns [ "warn1", ... ] -> This doesn't give the muted role !!!\n${prefix}user set <id> muted { "start": <timestamp start>, "end": <timestamp end> } -> This doesn't give the muted role !!!`,
  async execute(_client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {

      const users = require('../../helpers/firestorm/users.js')

      let type = args[0]
      let id = args[1] || undefined
      let field = args[2]
      let options1 = args[3]
      let user = undefined

      var embed = new Discord.MessageEmbed().setColor(colors.BLUE)

      if (id === undefined) return warnUser(message, "Please specify a Discord ID")

      // delete a user from the users collection
      if (type == "delete") {
        try {
          await users.get(id)
        }
        catch (err) {
          return warnUser(message, `I can't find this ID:\n${err}`)
        }

        users.remove(id)

        embed.setDescription(`Successfully removed <@!${id}> from the users collection.`)
        message.inlineReply(embed)
      }

      // add a new user to the users collection
      if (type == "add") {

        // test if the user already exist
        try {
          user = await users.get(id) || undefined
        }
        catch (_err) { /* Expected result */}
        if (user != undefined) return warnUser(message, `This user already exist, type \`${prefix}user get <id>\` to see it's data`)

        users.set(id, {
          username: args[2] ? args.slice(2).join(' ') : null,
          uuid: null,
          warns: [],
          muted: [],
          type: [ 'member' ]
        })

        embed.setDescription(`Successfully added <@!${id}> to the users collection.`)
        message.inlineReply(embed)
      }

      if (type == "set") {

        try {
          user = await users.get(id)
        }
        catch (err) {
          return warnUser(message, `I can't find this ID:\n${err}`)
        }

        if (field == "name" && options1 !== undefined) {
          user.username = args.slice(3).join(' '),
          users.set(id, user)

          embed.setDescription(`Successfully changed the name of <@!${id}>.`)
          message.inlineReply(embed)
        } else if (field == "name" && options1 === undefined) return warnUser(message, "Please, specify a name")

        if (field == "type" && options1 !== undefined) {

          // test if the provided array is valid
          let arr = new Array()
          try {
            arr = JSON.parse(args.slice(3).join(' '))
          }
          catch (err) {
            return warnUser(message, "The provied JSON Array is invalid.")
          }

          user.type = arr;
          users.set(id, user)

          embed.setDescription(`Successfully set type of <@!${id}>.`)
          message.inlineReply(embed)

        } else if (field == "type" && options1 === undefined) return warnUser(message, `Please use a JSON Array:\n\`${prefix}users set type <id> [ "member" , ...]\``)


        if (field == "warns" && options1 !== undefined) {

          // test if the provided array is valid
          let arr = new Array()
          try {
            arr = JSON.parse(args.slice(3).join(' '))
          }
          catch (err) {
            return warnUser(message, "The provied JSON Array is invalid.")
          }

          user.warns = arr;
          users.set(id, user)

          embed.setDescription(`Successfully set warns of <@!${id}>.`)
          message.inlineReply(embed)
          
        } else if (field == "warns" && options1 === undefined) return warnUser(message, `Please use a JSON Array:\n\`${prefix}users set warns <id> [ "warn example 1" , ...]\``)

        if (field == "muted" && options1 !== undefined) {

          // test if the provided object is valid
          let obj = new Object()
          try {
            obj = JSON.parse(args.slice(3).join(' '))
          }
          catch (err) {
            return warnUser(message, "The provied JSON Object is invalid.")
          }

          if (!obj.start || !obj.end) return warnUser(message, "You have to specify a start & end parameters inside the object:\n`{ \"start\": 0, \"end\": 0 }`")

          user.muted = { start: obj.start, end: obj.end } // prevent other parameters to be added
          users.set(id, user)

          embed.setDescription(`Successfully set mute parameters of <@!${id}>.`)
          message.inlineReply(embed)

        } else if (field == "warns" && options1 === undefined) return warnUser(message, `Please use a JSON Object:\n\`${prefix}users set muted <id> { "start": 0, "end": 0 }\``)

      }

    } else return
  }
}