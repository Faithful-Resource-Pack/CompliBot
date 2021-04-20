/* eslint-disable no-unreachable */
/* global process */
const prefix = process.env.PREFIX

require('dotenv').config()
const Discord   = require('discord.js')
const getops    = require('getopts')
const Canvas    = require('canvas')

const strings  = require('../../res/strings')

const FindTexture = require('../../functions/textures/findTexture')
const choiceEmbed = require('../../helpers/choiceEmbed')
const promiseEvery = require('../../helpers/promiseEvery')
const { warnUser } = require('../../functions/warnUser')

const RES_SIDE = [16, 32, 64]
const RES_JAVA = 'j'
const RES_BEDROCK = 'b'
const RES_ALLOWED = [ ...RES_SIDE.map(el => `${el}${RES_JAVA}`), ...RES_SIDE.map(el => `${el}${RES_BEDROCK}`)]

module.exports = {
	name: 'compare',
	aliases: ['cmp'],
	description: strings.HELP_DESC_COMPARE,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}compare <search> <--resolution|--res|--r>=<${RES_ALLOWED.join('|')}> [<--scale|--s>=<1..10>]`,
  example: `${prefix}compare bucket --resolution=16j  --res=32j --r=64j --s=2\n${prefix}cmp bucket -resolution 16j -res 32j -r 64j -s 2\n${prefix}cmp bucket -r 16j 32j 64j -s 2\n${prefix}cmp bucket 16j 32j 64j -s 2`,

  /**
   * 
   * @param {Discord.Client} client Incoming Discord client
   * @param {Discord.Message} message Incomming command
   * @param {Array<String>} args Argument array after the command
   */
  // eslint-disable-next-line no-unused-vars
  async execute(client, message, args) {
    const parsedArguments = getops(args, {
      alias: {
        resolution: ['res', 'r'],
        scale: ['s']
      }
    })

    // give default value to resolutions
    if(!parsedArguments.resolution)
      parsedArguments.resolution = []
    
    // else put in array to simplify comparaison
    else if(typeof(parsedArguments.resolution) === 'string')
      parsedArguments.resolution = [parsedArguments.resolution]

    if(!parsedArguments._)
      parsedArguments._ = ''
    let search
    const searchTerms = []
    if(typeof(parsedArguments._) === 'string') {
      search = parsedArguments._
    } else {
      parsedArguments._.forEach(el => {
        if(RES_ALLOWED.includes(el)) {
          parsedArguments.resolution.push(el)
        } else {
          searchTerms.push(el)
        }
      })

      search = searchTerms.join(' ')
    }

    // Check correct args
    let correctRes = parsedArguments.resolution && (typeof(parsedArguments.resolution) === 'string' || parsedArguments.resolution.length > 0)

    // reject if no resolutions
    if(!correctRes) {
      await warnUser(message, `${strings.COMMAND_WRONG_ARGUMENTS_GIVEN}\n No resolutions.`)
      return
    }

    // check if and what incorrect res
    // also we determine minecraft edition search
    let incorrectRes = ''
    let java = false
    let bedrock = false
    let resIndex = 0
    while(resIndex < parsedArguments.resolution.length && correctRes) {
      if(!RES_ALLOWED.includes(parsedArguments.resolution[resIndex])) {
        correctRes = false
        incorrectRes = parsedArguments.resolution[resIndex]
      }
      else if(!java && parsedArguments.resolution[resIndex].endsWith('j')) {
        java = true
      } else if(!bedrock && parsedArguments.resolution[resIndex].endsWith('b')) {
        bedrock = true
      }

      ++resIndex
    }

    // reject if so
    if(!correctRes) {
      await warnUser(message, `${strings.COMMAND_WRONG_ARGUMENTS_GIVEN}\nIncorrect resolution : ${incorrectRes}`)
      return
    }

    // replace default value to scale else limit it
    if(!parsedArguments.scale || typeof(parsedArguments.scale) !== 'number')
      parsedArguments.scale = 1
    else
      parsedArguments.scale = Math.min(Math.max(Math.round(parsedArguments.scale), 1), 10)

    // if we have java and bedrock resolutions, we search in java and after we will check if there is a bedrock url
    const searchInJava = java ? true : false

    // search in correct file
    let findPromise
    if(searchInJava) {
      findPromise = FindTexture.findJava(search)
    }
    else {
      findPromise = FindTexture.findBedrock(search)
    }

    // determine if error
    let results = await findPromise
    .catch(err => {
      if(process.env.DEBUG) console.error(err)
    })

    // if you don't get results error
    if(!results || results.length == 0) {
      await warnUser(message, `${strings.TEXTURE_DOESNT_EXIST}\nCouldn't find any match for search : ${search}`)
      return
    }

    // choose if multiple result
    /** @type {FindTexture.SearchResult} */
    let finalResult
    if(results.length > 1) {
      finalResult = await choiceEmbed(message, {
        title: `Select texture for search: '${search}'`,
        footer: `${message.client.user.username}`,
        propositions: results.map(searchItem => searchItem.path)
      })
      .then(choice => {
        return results[choice.index]
      })
      .catch((message, error) => {
        if(process.env.DEBUG) console.error(message, error)
      })
    } else {
      finalResult = results[0]
    }

    // if eventually still no result it means the user didn't chose the texture fase enough
    if(!finalResult) {
      await warnUser(message, strings.TEXTURE_NOT_CHOSEN)
      return
    }

    // determine respecitve java and bedrock paths
    let javaTexturePath = java ? finalResult.path : undefined
    let bedrockTexturePath = (java && bedrock) ? finalResult.bedrockPath : finalResult.path

    // reject if wanted bedrock and java so if foind bedrock path
    if(java && bedrock && !finalResult.bedrockPath) {
      await warnUser(`Texture doesn't have a bedrock version`)
      return
    }

    // start get promises on textures
    const textureResolutions = parsedArguments.resolution
    const texturePromises = []
    textureResolutions.forEach(res => {
      const url = FindTexture.pathToTextureURL(res.endsWith('j') ? javaTexturePath : bedrockTexturePath, res.endsWith('j') ? 'java' : 'bedrock', parseInt(res))
      texturePromises.push(Canvas.loadImage(url))
    })

    // get texture buffers
    let promiseResults = await promiseEvery(texturePromises)

    // if there is some errors
    if(!promiseResults || promiseResults.results.includes(undefined)) {
      // if undefined then all are errors
      let failedRes = (!promiseResults) ? textureResolutions : []

      // if one suceeded promises succeeded with value
      if(promiseResults) {
        // fetch failed resolutions in errors
        promiseResults.errors.forEach((err, index) => {
          if(err !== undefined) failedRes.push(textureResolutions[index])
        })
      }

      // warn user of failed textures
      await warnUser(message, `Failed to load textures for given resolutions: ${failedRes.join(', ')}`)
    }

    // sort texture images by res and not undefined
    // map to make structure with res and image
    // filter where obj.image is not undefined
    // sort by obj.res ascending
    // map to get image back
    const textureImages = promiseResults.results.map((value, index) => { return {res: textureResolutions[index], image: value }}).filter(obj => obj.image !== undefined).sort((a, b) => parseInt(a.res) - parseInt(b.res)).map(obj => obj.image)

    // get image data from image
    const texturesImageData = textureImages.map(image => {
      const ctx = Canvas.createCanvas(image.naturalWidth, image.naturalHeight).getContext('2d')
      ctx.drawImage(image, 0, 0)
      return ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data
    })

    // make new big canvas
    // height is the maximum height
    // width is n * maximum width
    // sorted by res so last one is bigger
    const referenceHeight = textureImages[textureImages.length - 1].naturalHeight * parsedArguments.scale
    const referenceWidth  = textureImages[textureImages.length - 1].naturalWidth  * parsedArguments.scale

    const canvasHeight = referenceHeight
    const canvasWidth  =  referenceWidth * textureImages.length

    const canvasResult = Canvas.createCanvas(canvasWidth, canvasHeight)
    const ctx = canvasResult.getContext('2d')
    let textureImage, textureImageData, scale, xOffset, pixelIndex, r, g, b, a
    for(let texIndex = 0; texIndex < textureImages.length; ++texIndex) {
      // get image
      textureImage = textureImages[texIndex]
      textureImageData = texturesImageData[texIndex]

      scale = Math.floor(referenceWidth / textureImage.naturalWidth)
      xOffset = referenceWidth * texIndex
      for(let x = 0; x < textureImage.naturalWidth; ++x) {
        for(let y = 0; y < textureImage.naturalHeight; ++y) {
          pixelIndex = (y * textureImage.naturalWidth + x) * 4
          r = textureImageData[pixelIndex]
          g = textureImageData[pixelIndex + 1]
          b = textureImageData[pixelIndex + 2]
          a = textureImageData[pixelIndex + 3]

          ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
          ctx.fillRect(xOffset + x*scale, y*scale, scale, scale)
        }
      }
    }

    const attachment = new Discord.MessageAttachment(canvasResult.toBuffer(), 'output.png')
    const embedMessage = await message.inlineReply(attachment)
    
    if (message.channel.type != 'dm') await embedMessage.react('🗑️')

		const filter = (reaction, user) => {
			return ['🗑️'].includes(reaction.emoji.name) && user.id === message.author.id;
		};

		embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first();
				if (reaction.emoji.name === '🗑️') {
					embedMessage.delete();
					if (!message.deleted) message.delete();
				}
			})
			.catch(async () => {
				if (message.channel.type != 'dm') await embedMessage.reactions.cache.get('🗑️').remove();
			})
  }
}