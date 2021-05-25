/* eslint-disable no-irregular-whitespace */

const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const { warnUser } = require('../../functions/warnUser');
const colors   = require('../../res/colors');
const strings  = require('../../res/strings');
const settings = require('../../settings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

module.exports = {
  name: 'database',
  aliases: ['db'],
  description: 'Fix or modify database elements directly from the bot',
  guildOnly: false,
  uses: strings.COMMAND_USES_DEVS,
  syntax: `${prefix}database <set> <#id> <field> <value>\n${prefix}db <get> <#id>\n${prefix}db <delete> <#id>\n${prefix}db <add> <#id> <field> <value>`,
  args: true,
  example: `${prefix}db set #1 name configure_icon`,
  async execute(_client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {

      const textures = require('../../helpers/firestorm/texture')
      const paths = require('../../helpers/firestorm/texture_paths')

      let type = args[0]
      let id = args[1] ? (args[1].startsWith('#') ? args[1].slice(1) : args[1]) : undefined
      let field = args[2]
      let options1 = args[3]
      let texture

      var embed = new Discord.MessageEmbed().setColor(colors.BLUE)

      if (type == 'get') {
        texture = await textures.get(id)

        let text = []

        if (field == 'uses') {
          let uses = await texture.uses()
          for (let i = 0; uses[i]; i++) {
            let paths = await uses[i].paths()
            let pathsText = []
            for (let x = 0; paths[x]; x++) {
              pathsText.push(`
              　　　{
              　　　　**useID**: ${paths[x].useID},
              　　　　**path**: ${paths[x].path},
              　　　　**versions**: [${paths[x].versions.join(', ')}],
              　　　　**use**: _function()_,
              　　　　**texture**: _function()_
              　　　}`)
            }
            text.push(`
            　{
            　　**textureID**: ${uses[i].textureID},
            　　**textureUseName**: "${uses[i].textureUseName}",
            　　**editions**: [${uses[i].editions.join(', ')}],
            　　**id**: ${uses[i].id},
            　　**texture**: function(),
            　　**paths**: [${pathsText.join(',')}
            　　],
            　　**animation**: _function()_
            　}
            `)
          }

          embed.setDescription(`**uses:**\n[${text.join(',\n')}]`)
        }

        else if (field !== undefined) embed.setDescription(`${field} is not set up yet.`)

        embed.addFields(
            { name: 'name:', value: texture.name },
            { name: 'id:', value: texture.id },
          )
        
        message.inlineReply(embed)
      }

      if (type == 'add') {
        if (field == undefined) warnUser(message, 'You need to provide a field value')
        texture = await textures.get(id)

        if (field == 'uses') {
          let uses = await texture.uses()

          /**
           * TODO: finish it -> add to array, send to database
           * HELP: how did i add a function to an object???
           */
        }
        else embed.setDescription(`${field} is not set up yet.`)

        message.inlineReply(embed)
      }
      if (type == 'set') {
        if (field == undefined) warnUser(message, 'You need to provide a field value')

        if (field == 'name') {
          textures.set(id, {
            name: options1
          })
          
          embed.setDescription(`type \`${prefix}db get ${id}\` to see changes`)
        }
        else embed.setDescription(`${field} is not set up yet.`)

        message.inlineReply(embed)
      }
      if (type == 'delete') {
        embed.setDescription('WIP')
        message.inlineReply(embed)
      }
      if (type == 'merge') {
        embed.setDescription('WIP')
        message.inlineReply(embed)
      }

      
    } else return
  }
}