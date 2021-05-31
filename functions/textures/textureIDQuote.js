const Discord  = require("discord.js");
const colors   = require('../../ressources/colors.js');
const settings = require('../../ressources/settings.js');
const fetch    = require('node-fetch');
const { timestampConverter } = require('../../helpers/timestampConverter');

const CANVAS_FUNCTION_PATH = '../../functions/canvas'
function nocache(module) { require('fs').watchFile(require('path').resolve(module), () => { delete require.cache[require.resolve(module)] }) }
nocache(CANVAS_FUNCTION_PATH)

/**
 * Quote when a user specify a list of valids texture id's
 * @param {DiscordMessage} message Discord message
 * @param {String} content message content 
 */
async function textureIDQuote(message) {
  const args = message.content.split(' ') // get all words in the message content
  let ids = args.filter(el => el.charAt(0) === '[' && el.charAt(1) === '#' && el.slice(-1) == "]").map(el => el.slice(2, el.length - 1)) // filter textures ids and slice '#'
  ids = ids.filter(el => el != '').filter((el, index) => ids.indexOf(el) === index && el >= 0) // avoid doublon, empty and wrong id

  const texturesCollection = require('../../helpers/firestorm/texture')
  const promiseEvery = require('../../helpers/promiseEvery')
  const promiseArray = ids.map(id => texturesCollection.get(id))

  let res = await promiseEvery(promiseArray).catch(() => {})

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

    let pathText = []
    for (let i = 0; uses[i]; i++) {
      let localPath = await uses[i].paths()
      for (let k = 0; localPath[k]; k++) {
        pathText.push(`\`[${localPath[k].versions[localPath[k].versions.length - 1]}+]\` ${localPath[k].path}`)
      }
    }

    let path = texturePath[0].path
    let editions = uses[0].editions

    let contrib32 = await texture.lastContribution('c32')
    let timestamp32 = contrib32 ? contrib32.date : undefined
    let author32 = contrib32 ? contrib32.contributors : undefined

    let contrib64 = await texture.lastContribution('c64')
    let timestamp64 = contrib64 ? contrib64.date : undefined
    let author64 = contrib64 ? contrib64.contributors : undefined

    const paths = {}
    if (editions.includes('java')) {
      paths.c16 = settings.DEFAULT_MC_JAVA_TEXTURE + path;
      paths.c32 = `https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-32x/Jappa-1.17/assets/${path}`
      paths.c64 = `https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Java-64x/Jappa-1.17/assets/${path}`
    } 
    else {
      paths.c16 = settings.DEFAULT_MC_BEDROCK_TEXTURE + path;
      paths.c32 = `https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-32x/Jappa-1.16.210/${path}`
      paths.c64 = `https://raw.githubusercontent.com/Compliance-Resource-Pack/Compliance-Bedrock-64x/Jappa-1.16.210/${path}`
    }

    /** @type {import('../helpers/firestorm/users').User} */

    let author = [ author32, author64 ]
    let timestamp = [ timestamp32, timestamp64 ]

    const CanvasDrawer = require(CANVAS_FUNCTION_PATH)
    const drawer = new CanvasDrawer()
    
    drawer.urls = [paths.c16, paths.c32, paths.c64]
    let resultsPromises = await Promise.all(drawer.urls.map(url => fetch(url))).catch(() => drawer.urls = [])
    drawer.urls = drawer.urls.filter((__el, index) => resultsPromises[index].ok && resultsPromises[index].status === 200)

    const bufferResult = await drawer.draw().catch(err => { throw err })
    const attachment = new Discord.MessageAttachment(bufferResult, 'output.png')

    var embed = new Discord.MessageEmbed()
      .setTitle(`[#${id}] - ${name}`)
      .setColor(colors.BLUE)
      .attachFiles(attachment)
      .setImage('attachment://output.png')
      .addFields(
        { name: '32x', value: author[0] != undefined && author[0].length ? `<@!${author[0].join('> <@!')}> - ${timestampConverter(timestamp[0])}` : `Contribution not found` },
        { name: '64x', value: author[1] != undefined && author[1].length ? `<@!${author[1].join('> <@!')}> - ${timestampConverter(timestamp[1])}` : `Contribution not found` },
        { name: 'Paths', value: pathText.join('\n') }
      )

    const embedMessage = await message.inlineReply(embed)
		if (message.channel.type !== 'dm') await embedMessage.react('🗑️')

		const filter = (reaction, user) => {
			return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id
		}

		embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first()
				if (reaction.emoji.name === '🗑️') {
					await embedMessage.delete()
				}
			})
			.catch(async () => {
				if (!embedMessage.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🗑️').remove()
			})
  }

}

exports.textureIDQuote = textureIDQuote