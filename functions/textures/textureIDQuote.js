const Discord  = require("discord.js");
const colors   = require('../../res/colors.js');

// const strings  = require('../res/strings');
const { warnUser } = require('../warnUser');
const { timestampConverter } = require('../timestampConverter');

/**
 * Quote when a use specify a list of valids texture id's
 * @param {DiscordMessage} message Discord message
 * @param {String} content message content 
 */
async function textureIDQuote(message, content) {
  const args = content.split(' ') // get all words in the message content
  let ids = args.filter(el => el.charAt(0) === '#' && !isNaN(el.slice(1))).map(el => el.slice(1)) // filter textures ids and slice '#'
  ids = ids.filter((el, index) => ids.indexOf(el) === index) // avoid doublon

  const texturesCollection = require('../../helpers/firestorm/texture')
  const promiseEvery = require('../../helpers/promiseEvery')
  const promiseArray = ids.map(id => texturesCollection.get(id))

  let res = await promiseEvery(promiseArray).catch(err => console.error(err))
  
  if (!res) return // if nothing is found -> we don't deserve it.
  else res = res.results.filter(el => el !== undefined)

  for (let i = 0; i < res.length; i++) {
    let texture = res[i];

    let id = texture.id
    let name = texture.name

    /** @type {import("../../helpers/firestorm/texture_use.js").TextureUse[]} */
    let uses = await texture.uses()

    /** @type {import("../../helpers/firestorm/texture_paths.js").TexturePath[]} */
    let texturePath = await uses[0].paths()

    let path = texturePath[0].path
    let editions = uses[0].editions

    let contrib32 = await texture.lastContribution('c32')
    let timestamp32 = contrib32 ? contrib32.date : undefined
    let author32 = contrib32 ? contrib32.contributors : undefined

    let contrib64 = await texture.lastContribution('c64')
    let timestamp64 = contrib64 ? contrib64.date : undefined
    let author64 = contrib64 ? contrib64.contributors : undefined

    const pathObj = {}
    if (editions.includes('java')) {
      pathObj.c32 = `https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-32x/Jappa-1.17/assets/${path}`
      pathObj.c64 = `https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-64x/Jappa-1.17/assets/${path}`
    } else warnUser(message, "Not defined yet!")

    /** @type {import('../helpers/firestorm/users').User} */

    let author = [ author32, author64 ]
    let timestamp = [ timestamp32, timestamp64 ]

    let resolution = ['32x', '64x']

    makeEmbed(message, author, timestamp, pathObj, name, id, resolution)
  }

}

function makeEmbed(message, author, timestamp, path, name, id, res) {

  if (!name) name = path.c32.split('/').pop().replace('.png', '').split('_').map(el => el.substring(0, 1).toUpperCase() + el.substring(1)).join(' ')

  var embed = new Discord.MessageEmbed()
    .setTitle(`#${id} - ${name}`)
    .setColor(colors.BLUE)
    .setImage('https://media.tenor.com/images/44bc157770217f4851bc4a83c208531a/tenor.gif')

    res.forEach((r, index) => {
      embed.addField(
        r,
        author[index] != undefined && author[index].length ? `<@!${author[index].join('> <@!')}> - ${timestampConverter(timestamp[index])}` : `No information`
      )
    })


  return message.inlineReply(embed);
}

exports.textureIDQuote = textureIDQuote