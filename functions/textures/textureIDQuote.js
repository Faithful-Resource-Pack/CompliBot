const Discord  = require("discord.js");
const colors   = require('../../resources/colors');
const settings = require('../../resources/settings');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { timestampConverter } = require('../../helpers/timestampConverter');
const { addDeleteReact } = require("../../helpers/addDeleteReact");
const { ID_FIELD } = require("../../helpers/firestorm");

require('../../helpers/jsExtension');

const CANVAS_FUNCTION_PATH = '../../functions/textures/canvas'
function nocache(module) { require('fs').watchFile(require('path').resolve(module), () => { delete require.cache[require.resolve(module)] }) }
nocache(CANVAS_FUNCTION_PATH)

/**
 * Quote when a user specify a list of valids texture id's
 * @param {Discord.Message} message Discord message
 */
async function textureIDQuote(message) {
  const args = message.content.split(' ') // get all words in the message content
  let ids = args.filter(el => el.charAt(0) === '[' && el.charAt(1) === '#' && el.slice(-1) == "]").map(el => el.slice(2, el.length - 1)) // filter textures ids and slice '#'
  ids = ids.filter(el => el != '').filter((el, index) => ids.indexOf(el) === index && el >= 0) // avoid doublon, empty and wrong id

  if(ids.length === 0) return

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
    
    let texturePath = undefined
    let path = undefined
    let textureFirstEdition = '' // get the edition // TODO: Support BEDROCK AND JAVA for texture id (here we only take the fist use edition)
    
    const pathObject = {}
    const pathTitleObject = {}
    if(uses !== undefined && Array.isArray(uses) && uses.length > 0) {
      /** @type {import("../../helpers/firestorm/texture_paths.js").TexturePath[]} */
      texturePath = await uses[0].paths()

      for (let i = 0; i < uses.length; i++) {
        const useEdition = Array.isArray(uses[i].editions) && uses[i].editions.length > 0 ? uses[i].editions[0] : '' + uses[0].editions
        const useEditionLc = useEdition.toLowerCase()

        if(pathObject[useEditionLc] === undefined) {
          pathObject[useEditionLc] = []
          pathTitleObject[useEditionLc] = useEdition.capitalize()
        }

        let localPath = await uses[i].paths()
        for (let k = 0; k < localPath.length; k++) {
          const useVersionsSorted = localPath[k].versions.sort()
          const versionPrefix = `\`[${useVersionsSorted[0]}${useVersionsSorted.length > 1 ? ` — ${useVersionsSorted[useVersionsSorted.length - 1]}` : ''}]\``
          pathObject[useEditionLc].push(`${versionPrefix} ${localPath[k].path}`)
        }
        if(localPath.length === 0) pathObject[useEditionLc].push('No texture path for the use ' + uses[i][ID_FIELD])
      }
  
      path = texturePath[0].path
      textureFirstEdition = Array.isArray(uses[0].editions) && uses[0].editions.length > 0 ? uses[0].editions[0] : '' + uses[0].editions
    }

    let contrib32   = await texture.lastContribution('c32')
    let timestamp32 = contrib32 ? contrib32.date : undefined
    let author32    = contrib32 ? contrib32.contributors : undefined

    let contrib64   = await texture.lastContribution('c64')
    let timestamp64 = contrib64 ? contrib64.date : undefined
    let author64    = contrib64 ? contrib64.contributors : undefined

    const paths = {}
    const pathVersion = texturePath[0].versions[0]
    if (textureFirstEdition.includes('java')) {
      paths.c16 = settings.DEFAULT_MC_JAVA_REPOSITORY + pathVersion + '/' + path
      paths.c32 = settings.COMPLIANCE_32X_JAVA_REPOSITORY_JAPPA + pathVersion + '/' + path
      paths.c64 = settings.COMPLIANCE_64X_JAVA_REPOSITORY_JAPPA + pathVersion + '/' + path
    } 
    else {
      paths.c16 = settings.DEFAULT_MC_BEDROCK_REPOSITORY + pathVersion + '/' + path
      paths.c32 = settings.COMPLIANCE_32X_BEDROCK_REPOSITORY_JAPPA + pathVersion + '/' + path
      paths.c64 = settings.COMPLIANCE_64X_BEDROCK_REPOSITORY_JAPPA + pathVersion + '/' + path
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

    let pathValue = Object.keys(pathTitleObject).map(editionLc => `**__${pathTitleObject[editionLc]}__**\n${pathObject[editionLc].join('\n')}`).join('\n').substr(0, 2048)

    var embed = new Discord.MessageEmbed()
      .setTitle(`[#${id}] ${name}`)
      .setColor(colors.BLUE)
      .setImage('attachment://output.png')
      .addField('Paths', pathValue, false)
      .addFields(
        { name: '32x', value: author[0] != undefined && author[0].length ? `<@!${author[0].join('> <@!')}> - ${timestampConverter(timestamp[0])}` : `Contribution not found` },
        { name: '64x', value: author[1] != undefined && author[1].length ? `<@!${author[1].join('> <@!')}> - ${timestampConverter(timestamp[1])}` : `Contribution not found` },
        // \u200B empty character not inline field is not working in v13, generating empty field error
      )

    message.reply({embeds: [embed], files: [attachment]})
      .catch(() => {}) // avoids crashes if unknown message
      .then(embedMessage => {
        return addDeleteReact(embedMessage, message)
      })
  }
}

exports.textureIDQuote = textureIDQuote