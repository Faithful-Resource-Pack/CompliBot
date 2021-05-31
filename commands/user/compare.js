/* eslint-disable no-unreachable */
const prefix = process.env.PREFIX

require('dotenv').config()
const Discord = require('discord.js')
const getops  = require('getopts')
const strings = require('../../ressources/strings')

const FindTexture  = require('../../functions/textures/findTexture')
const choiceEmbed  = require('../../helpers/choiceEmbed')
const { warnUser } = require('../../helpers/warnUser')

const RES_SIDE = [16, 32, 64]
const RES_JAVA = 'j'
const RES_BEDROCK = 'b'
const RES_ALLOWED = [...RES_SIDE.map(el => `${el}${RES_JAVA}`), ...RES_SIDE.map(el => `${el}${RES_BEDROCK}`)]

const CANVAS_FUNCTION_PATH = '../../functions/canvas'

function nocache (module) { require('fs').watchFile(require('path').resolve(module), () => { delete require.cache[require.resolve(module)] }) }
nocache(CANVAS_FUNCTION_PATH)

module.exports = {
  name: 'compare',
  aliases: ['cmp'],
  description: strings.HELP_DESC_COMPARE,
  guildOnly: false,
  uses: strings.COMMAND_USES_ANYONE,
  syntax: `${prefix}compare <search> <--resolution|--res|--r>=<${RES_ALLOWED.join('|')}> [<--scale|--s>=<1..10>]`,
  example: `${prefix}compare bucket --resolution 16j 32j 64j --s=2\n${prefix}cmp bucket -resolution 16j 32j -s 2\n${prefix}cmp bucket -r 16j 32j 64j -s 10\n${prefix}cmp bucket 16j 32j 64j -s 2`,

  /**
   *
   * @param {Discord.Client} client Incoming Discord client
   * @param {Discord.Message} message Incomming command
   * @param {Array<String>} args Argument array after the command
   */
  // eslint-disable-next-line no-unused-vars
  async execute (client, message, args) {
    const parsedArguments = getops(args, {
      alias: {
        resolution: ['res', 'r'],
        scale: ['s']
      }
    })

    // give default value to resolutions
    if (!parsedArguments.resolution) parsedArguments.resolution = []

    // else put in array to simplify comparaison
    else if (typeof (parsedArguments.resolution) === 'string') { parsedArguments.resolution = [parsedArguments.resolution] }

    if (!parsedArguments._) { parsedArguments._ = '' }
    let search
    const searchTerms = []
    if (typeof (parsedArguments._) === 'string') {
      search = parsedArguments._
    } else {
      parsedArguments._.forEach(el => {
        if (RES_ALLOWED.includes(el)) {
          parsedArguments.resolution.push(el)
        } else {
          searchTerms.push(el)
        }
      })

      search = searchTerms.join(' ')
    }

    // Check correct args
    let correctRes = parsedArguments.resolution && (typeof (parsedArguments.resolution) === 'string' || parsedArguments.resolution.length > 0)

    // reject if no resolutions
    if (!correctRes) {
      await warnUser(message, `${strings.COMMAND_WRONG_ARGUMENTS_GIVEN}\n No resolutions.`)
      return
    }

    // check if and what incorrect res
    // also we determine minecraft edition search
    let incorrectRes = ''
    let java = false
    let bedrock = false
    let resIndex = 0
    while (resIndex < parsedArguments.resolution.length && correctRes) {
      if (!RES_ALLOWED.includes(parsedArguments.resolution[resIndex])) {
        correctRes = false
        incorrectRes = parsedArguments.resolution[resIndex]
      } else if (!java && parsedArguments.resolution[resIndex].endsWith('j')) {
        java = true
      } else if (!bedrock && parsedArguments.resolution[resIndex].endsWith('b')) {
        bedrock = true
      }

      ++resIndex
    }

    // reject if so
    if (!correctRes) {
      await warnUser(message, `${strings.COMMAND_WRONG_ARGUMENTS_GIVEN}\nIncorrect resolution : ${incorrectRes}`)
      return
    }

    // replace default value to scale else limit it
    if (!parsedArguments.scale || typeof (parsedArguments.scale) !== 'number') { parsedArguments.scale = 1 } else { parsedArguments.scale = Math.min(Math.max(Math.round(parsedArguments.scale), 1), 10) }

    // if we have java and bedrock resolutions, we search in java and after we will check if there is a bedrock url
    const searchInJava = !!java

    // search in correct file
    let findPromise
    if (searchInJava) {
      findPromise = FindTexture.findJava(search)
    } else {
      findPromise = FindTexture.findBedrock(search)
    }

    // determine if error
    const results = await findPromise
      .catch(err => {
        if (process.env.DEBUG) console.error(err)
      })

    // if you don't get results error
    if (!results || results.length === 0) {
      await warnUser(message, `${strings.TEXTURE_DOESNT_EXIST}\nCouldn't find any match for search : ${search}`)
      return
    }

    // choose if multiple result
    /** @type {FindTexture.SearchResult} */
    let finalResult
    if (results.length > 1) {
      finalResult = await choiceEmbed(message, {
        title: `Select texture for search: '${search}'`,
        footer: `${message.client.user.username}`,
        propositions: results.map(searchItem => searchItem.path)
      })
        .then(choice => {
          return results[choice.index]
        })
        .catch((message, error) => {
          if (process.env.DEBUG) console.error(message, error)
        })
    } else {
      finalResult = results[0]
    }

    // if eventually still no result it means the user didn't chose the texture fast enough
    if (!finalResult) {
      await warnUser(message, strings.TEXTURE_NOT_CHOSEN)
      return
    }

    // determine respecitve java and bedrock paths
    const javaTexturePath = java ? finalResult.path : undefined
    const bedrockTexturePath = (java && bedrock) ? finalResult.bedrockPath : finalResult.path

    // reject if wanted bedrock and java so if foind bedrock path
    if (java && bedrock && !finalResult.bedrockPath) {
      await warnUser(message, 'Texture doesn\'t have a bedrock version')
      return
    }

    // doing a dynamic import to reload canvas function
    const CanvasDrawer = require(CANVAS_FUNCTION_PATH)
    const drawer = new CanvasDrawer()

    drawer.scale = parsedArguments.scale || 1
    drawer.urls = parsedArguments.resolution.map(res => FindTexture.pathToTextureURL(res.endsWith('j') ? javaTexturePath : bedrockTexturePath, res.endsWith('j') ? 'java' : 'bedrock', parseInt(res)))

    // put 16 first and then increasing res and then yours
    drawer.order = parsedArguments.resolution.sort().map((el, index) => index)

    // unlimited attachments
    if (message.attachments.size > 0) {
      let orderSize = drawer.order.length
      const it = message.attachments.values()

      let result = it.next()
      while (!result.done) {
        console.log(result)
        drawer.urls.push(result.value.url)
        drawer.order.push(orderSize)

        result = it.next()
        ++orderSize
      }
    }

    const bufferResult = await drawer.draw().catch(err => {
      throw err
    })
    const attachment = new Discord.MessageAttachment(bufferResult, 'output.png')
    const embedMessage = await message.inlineReply(attachment)

    if (message.channel.type !== 'dm') await embedMessage.react('🗑️')

    const filter = (reaction, user) => {
      return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id
    }

    embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
      .then(async collected => {
        const reaction = collected.first()
        if (reaction.emoji.name === '🗑️') {
          embedMessage.delete()
          if (!message.deleted) message.delete()
        }
      })
      .catch(async () => {
        if (!embedMessage.deleted && message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🗑️').remove()
      })
  }
}
