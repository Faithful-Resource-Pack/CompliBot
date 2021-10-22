/* eslint-disable no-unreachable */
const prefix = process.env.PREFIX

require('dotenv').config()
const Discord     = require('discord.js')
const getops      = require('getopts')
const strings     = require('../../resources/strings')
const textures = require('../../helpers/firestorm/texture')
const FindTexture = require('../../functions/textures/findTexture')
const choiceEmbed = require('../../helpers/choiceEmbed')

const { warnUser }       = require('../../helpers/warnUser')
const { addDeleteReact } = require('../../helpers/addDeleteReact')

const RES_SIDE = [16, 32, 64]
const RES_JAVA = 'j'
const RES_BEDROCK = 'b'
const RES_ALLOWED = [...RES_SIDE.map(el => `${el}${RES_JAVA}`), ...RES_SIDE.map(el => `${el}${RES_BEDROCK}`)]

const CANVAS_FUNCTION_PATH = '../../functions/textures/canvas'

function nocache (module) { require('fs').watchFile(require('path').resolve(module), () => { delete require.cache[require.resolve(module)] }) }
nocache(CANVAS_FUNCTION_PATH)

const MinecraftSorter = (a, b) => {
	const aSplit = a.split('.').map(s => parseInt(s))
	const bSplit = b.split('.').map(s => parseInt(s))

	const upper = Math.min(aSplit.length, bSplit.length)
	let i = 0
	let result = 0
	while(i < upper && result == 0) {
		result = (aSplit[i] == bSplit[i]) ? 0 : (aSplit[i] < bSplit[i] ? -1 : 1) // each number
		++i
	}

	if(result != 0) return result

	result = (aSplit.length == bSplit.length) ? 0 : (aSplit.length < bSplit.length ? -1 : 1) // longer length wins

	return result
}

module.exports = {
  name: 'compare',
  aliases: ['cmp'],
  description: strings.HELP_DESC_COMPARE,
  guildOnly: false,
  uses: strings.COMMAND_USES_ANYONE,
  syntax: `${prefix}compare <search> <--resolution|--res|--r>=<${RES_ALLOWED.join('|')}> [<--scale|--s>=<1..10>]`,
  example: `${prefix}compare bucket --resolution 16j 32j 64j --s=2\n${prefix}cmp bucket -r 16j 32j 64j -s 10\n${prefix}cmp bucket 16j 32j 64j -s 2\n${prefix}cmp --id 1208 16j 32j 64j -s 2`,

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
        id: 'id',
        resolution: ['res', 'r'],
        scale: ['s']
      }
    })

    // give default value to resolutions
    if (!parsedArguments.resolution) parsedArguments.resolution = []

    // else put in array to simplify comparaison
    else if (typeof (parsedArguments.resolution) === 'string') { parsedArguments.resolution = [parsedArguments.resolution] }

    if (!parsedArguments._) { parsedArguments._ = '' }

    const idSearch = !!parsedArguments.id
    let search, id
    if(idSearch) {
      id = parseInt(parsedArguments.id)
      if(isNaN(id)) return warnUser(message, `${strings.COMMAND_WRONG_ARGUMENTS_GIVEN}\n Texture id is not an integer.`)
      parsedArguments.resolution.push(...parsedArguments._)
    } else {
      const searchTerms = []
      if (typeof (parsedArguments._) === 'string') {
        search = parsedArguments._
      } else {
        parsedArguments._.forEach(el => {
          if (RES_ALLOWED.includes(el)) {
            if(typeof parsedArguments.resolution !== 'string' && !Array.isArray(parsedArguments.resolution)) {
              return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN)
            } else {
              if(typeof parsedArguments.resolution === 'string') parsedArguments.resolution = [parsedArguments.resolution]
              parsedArguments.resolution.push(el)
            }
          } else {
            searchTerms.push(el)
          }
        })
  
        search = searchTerms.join(' ')
      }
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

    // search in correct file
    let findPromise = idSearch ? textures.get(id) : FindTexture.find(search)

    // determine if error
    let results = await findPromise
      .catch(err => {
        if (process.env.DEBUG) console.error(err)
      })

    if(idSearch) results = results !== undefined ? [results] : []
      
    // if you don't get results error
    // if it is an idSearch it will return undefined
    if (!results || results.length === 0) {
      await warnUser(message, `${strings.TEXTURE_DOESNT_EXIST}\nCouldn't find any match for ${ idSearch ? `id ${id}` : `search : ${search}`}`)
      return
    }

    // choose if multiple result
    let finalResult
    if (results.length > 1) {
      // get all the paths for the texture
      const uses = await Promise.all(results.map(tex => tex.uses()))
      const paths = await Promise.all(uses.map(u => u.length > 0 ? u[0].paths(): Promise.resolve([])))
      const latestPaths = paths.map(p => {
        // for all paths, sort them b
        let latestVersion = undefined
        let latestPath = undefined
        let bestVersion
        p.forEach((a) => {
          bestVersion = a.versions.sort(MinecraftSorter).reverse()[0]
          if(latestVersion === undefined || MinecraftSorter(latestVersion, bestVersion) <= 0) {
            latestVersion = bestVersion
            latestPath = a
          }

          return latestPath
        })

        return latestPath
      }).map(p => p.path)
      finalResult = await choiceEmbed(message, {
        title: `Select texture for search: '${search}'`,
        footer: `${message.client.user.username}`,
        propositions: latestPaths
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

    const uses = await finalResult.uses().catch(err => { return warnUser(message, err.message) })

    // sort uses by edition
    const usesPerEdition = uses.reduce((acc, cur) => {
      const edi = Array.isArray(cur.editions) ? cur.editions[0] : cur.editions
      if(acc[edi] === undefined) acc[edi] = cur
      return acc
    }, {})

    // determine respecitve java and bedrock paths
    const javaTexturePath = (java && usesPerEdition.java) ? (await usesPerEdition.java.paths())[0].path : undefined
    const bedrockTexturePath = (bedrock && usesPerEdition.bedrock) ? (await usesPerEdition.bedrock.paths())[0].path : undefined

    // reject if wanted bedrock and java so if foind bedrock path
    if(java) {
      if (bedrock && !usesPerEdition.bedrock) {
        await warnUser(message, 'Texture doesn\'t have a bedrock version')
        return
      }

      // reject if is bedcrock only texture and only java res arguments
      if(!bedrock && !usesPerEdition.java) {
        return warnUser(message, `${strings.TEXTURE_DOESNT_EXIST}\nTexture has no java version`)
      }
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
    const embedMessage = await message.reply({files: [attachment]})
    addDeleteReact(embedMessage, message, true)
  }
}
