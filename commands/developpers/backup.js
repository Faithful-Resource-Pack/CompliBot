const prefix  = process.env.PREFIX
const Discord = require('discord.js')
const strings = require('../../ressources/strings')

const fs            = require('fs')
const { githubPush }  = require('../../functions/push')
const allCollection = require('../../helpers/firestorm/all')
const { dirname, normalize, join } = require('path')

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT

module.exports = {
  name: 'backup',
  aliases: ['bdb'],
  description: 'Backup the database to the [JSON repository](https://github.com/Compliance-Resource-Pack/JSON)',
  guildOnly: false,
  uses: strings.COMMAND_USES_DEVS,
  syntax: `${prefix}backup`,
  args: true,
  example: `${prefix}bdb`,
  async execute(_client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {

      let animations    = JSON.stringify(await allCollection.animations.read_raw(),    null, 2)
      let contributions = JSON.stringify(await allCollection.contributions.read_raw(), null, 2)
      let texture       = JSON.stringify(await allCollection.texture.read_raw(),       null, 2)
      let texture_path  = JSON.stringify(await allCollection.texture_path.read_raw(),  null, 2)
      let texture_uses  = JSON.stringify(await allCollection.texture_use.read_raw(),   null, 2)
      let users         = JSON.stringify(await allCollection.users.read_raw(),         null, 2)

      fs.mkdirSync(dirname('json/database/'), { recursive: true })

      fs.writeFileSync(join(process.cwd(), normalize('json/database/animations.json')),    animations,    { flag: 'w', encoding: 'utf-8' })
      fs.writeFileSync(join(process.cwd(), normalize('json/database/contributions.json')), contributions, { flag: 'w', encoding: 'utf-8' })
      fs.writeFileSync(join(process.cwd(), normalize('json/database/texture.json')),       texture,       { flag: 'w', encoding: 'utf-8' })
      fs.writeFileSync(join(process.cwd(), normalize('json/database/texture_path.json')),  texture_path,  { flag: 'w', encoding: 'utf-8' })
      fs.writeFileSync(join(process.cwd(), normalize('json/database/texture_uses.json')),  texture_uses,  { flag: 'w', encoding: 'utf-8' })
      fs.writeFileSync(join(process.cwd(), normalize('json/database/users.json')),         users,         { flag: 'w', encoding: 'utf-8' })

      await githubPush('Compliance-Resource-Pack', 'JSON', 'main', `Manual backup executed by: ${message.author.username}`, './json/database/')
      await message.react('✅');
    }
  }
}