
const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
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
  async execute(_client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {

      const textures = require('../../helpers/firestorm/texture')
      const paths = require('../../helpers/firestorm/texture_paths')

      let type = args[0]
      let id = args[1].startsWith('#') ? args[1].slice(1) : args[1]
      let texture

      var embed = new Discord.MessageEmbed().setColor(colors.BLUE)

      if (type == 'get') {
        texture = await textures.get(id)

        let uses = await texture.uses()
        let contrib = await texture.contributions()
        let lastContrib = await texture.lastContribution()

        let usesText = []
        let contribText = []

        for (let i = 0; uses[i]; i++) {
          let paths = await uses[i].paths()
          let pathsText = []
          for (let x = 0; paths[x]; x++) {
            console.log(paths[x])
            pathsText.push(`　{\n　　useID: ${paths[x].useID},\n　　path: ${paths[x].path},\n　　versions: [${paths[x].versions.join(', ')}],\n　　use: function(),\n　　texture: function()\n　}`)
          }
          usesText.push(`textureID: ${uses[i].textureID},\ntextureUseName: "${uses[i].textureUseName}",\neditions: [${uses[i].editions.join(', ')}],\nid: ${uses[i].id},\ntexture: function(),\npaths: [\n${pathsText.join('\n')}\n],\nanimation: function()`)
        }
        for (let i = 0; contrib[i]; i++) {
          let contributors = await contrib[i].getContributors();
          let contributorsText = []
          for (let x = 0; contributors[x]; x++) {
            contributorsText.push(`　{\n　　username: ${contributors[x].username},\n　　type: [${contributors[x].type}],\n　　uuid: ${contributors[x].uuid},\n　　id: ${contributors[x].id},\n　　contributions: function()\n　}`)
          }
          contribText.push(`date: ${contrib[i].date},\nres: ${contrib[i].res},\ntextureID: ${contrib[i].textureID},\ncontributors: [${contrib[i].contributors}],\nid: ${contrib[i].id},\ngetContributors: [\n${contributorsText.join('\n')}\n],\ntexture: function()\n`)
        }
        if (lastContrib) lastContrib = `date: ${lastContrib.date},\nres: ${lastContrib.res},\ntextureID: ${lastContrib.textureID},\ncontributors: ${lastContrib.contributors},\nid: ${lastContrib.id},\ngetContributors: function(),\ntexture: function()`

        embed
          .addFields(
            { name: 'name:', value: texture.name },
            { name: 'id:', value: texture.id },
            { name: 'uses:', value: `[\n${usesText.join('\n\n')}\n]` },
            { name: 'contributions():', value: contrib[0] == undefined ? '[]' : `[\n${contribText.join('\n\n')}\n]` },
            { name: 'lastContribution():', value: lastContrib == undefined ? 'undefined' : lastContrib }
          )
      }

      if (type == 'add') {
        embed.setDescription('WIP')
      }
      if (type == 'set') {
        embed.setDescription('WIP')
      }
      if (type == 'delete') {
        embed.setDescription('WIP')
      }

      message.inlineReply(embed);
    } else return
  }
}