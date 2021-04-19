/* eslint-disable no-constant-condition */
/* global process */
const prefix = process.env.PREFIX

const Discord   = require('discord.js')
const { bargs } = require('bargs')
const Canvas    = require('canvas')

const settings = require('../../settings')
const strings  = require('../../res/strings')

const FindTexture = require('../../functions/textures/findTexture')
const choiceEmbed = require('../../helpers/choiceEmbed')
const { warnUser } = require('../../functions/warnUser')

const definitions = [
  { name: "left", type: String, aliases: [ "l" ] },
  { name: "right", type: String, aliases: [ "r" ] },
  { name: "search", type: String, default: true },
  { name: "scale", type: Number, aliases: ["s"] }
]

const RES_SIDE = [16, 32, 64]
const RES_JAVA = 'j'
const RES_BEDROCK = 'b'
const RES_ALLOWED = [ ...['16'] , ...RES_SIDE.map(el => `${el}${RES_JAVA}`), ...RES_SIDE.map(el => `${el}${RES_BEDROCK}`)]

module.exports = {
	name: 'compare',
	aliases: ['cmp'],
	description: strings.HELP_DESC_COMPARE,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}compare <search> <--left|-l> <${RES_ALLOWED.join('|')}> <--right|-r> <${RES_ALLOWED.join('|')}> [<--scale|-s> <1..10>]`,
  example: `${prefix}cmp bucket -l 16 -r 64j -s 2`,

  /**
   * 
   * @param {Discord.Client} client Incoming Discord client
   * @param {Discord.Message} message Incomming command
   * @param {Array<String>} args Argument array after the command
   */
  // eslint-disable-next-line no-unused-vars
  async execute(client, message, args) {
    const parsedArguments = bargs(definitions, args)

    // check id correct syntax
    if (
      !parsedArguments.left ||
      !RES_ALLOWED.includes(parsedArguments.left.toLowerCase()) ||
      !parsedArguments.right ||
      !RES_ALLOWED.includes(parsedArguments.left.toLowerCase()) ||
      parsedArguments.left == parsedArguments.right ||
      !parsedArguments.search
    ) {
      await warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN)
      return
    }
    parsedArguments.left = parsedArguments.left.toLowerCase()
    parsedArguments.right = parsedArguments.right.toLowerCase()

    if(!parsedArguments.scale)
      parsedArguments.scale = 1

    parsedArguments.scale = Math.min(Math.max(Math.round(parsedArguments.scale), 1), 10)

    // if we have 16 in parse arguments, use other to determine edition search
    // default argument chosen is left
    /** @type {String} */
    let searchEdition = parsedArguments.left
    if(parsedArguments.left === '16' || parsedArguments.right === '16') {
      // this operation is valid because we exluded same values for left and right
      searchEdition = (parsedArguments.left === '16') ? parsedArguments.right : parsedArguments.left
    }

    let findPromise
    if(searchEdition.endsWith(RES_JAVA)) {
      findPromise = FindTexture.findJava(parsedArguments.search)
    }
    else {
      findPromise = FindTexture.findBedrock(parsedArguments.search)
    }

    let results = await findPromise
    .catch(err => {
      if(false) console.error(err)
    })

    if(!results || results.length == 0) {
      await warnUser(message, strings.TEXTURE_DOESNT_EXIST)
      return
    }

    let finalResult
    if(results.length > 1) {
      finalResult = await choiceEmbed(message, {
        title: `Select among ${results.length} found textures`,
        footer: `${message.client.user.username}`,
        imageURL: settings.BOT_IMG,
        propositions: results.map(searchItem => searchItem.path)
      })
      .then(choice => {
        return results[choice.index]
      })
      .catch((message, error) => {
        if(false) console.error(message, error)
      })
    } else {
      finalResult = results[0]
    }

    if(!finalResult) {
      await warnUser(message, strings.TEXTURE_NOT_CHOSEN)
      return
    }

    // start get promises on textures
    const textureResolutions = [parsedArguments.left, parsedArguments.right].map(el => parseInt(el))
    const texturePromises = []
    textureResolutions.forEach(res => {
      const url = FindTexture.pathToTextureURL(finalResult.path, searchEdition.endsWith(RES_JAVA) ? 'java' : 'bedrock', parseInt(res))
      texturePromises.push(Canvas.loadImage(url))
    })

    // get texture buffers
    /** @type {Canvas.Image[]} */
    const textureImages = await Promise.all(texturePromises).catch(err => {
      if(false) console.error(err)
    })

    if(!textureImages) {
      await warnUser(message, strings.TEXTURE_DOESNT_EXIST)
      return
    }

    // sort by size decreasing
    textureImages.sort((a, b) => b.naturalHeight*b.naturalWidth - a.naturalHeight*a.naturalWidth)
    
    const texturesImageData = textureImages.map(image => {
      const ctx = Canvas.createCanvas(image.naturalWidth, image.naturalHeight).getContext('2d')
      ctx.drawImage(image, 0, 0)
      return ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data
    })

    // make new big canvas
    // height is the maximum height
    // width is n * maximum width
    const referenceHeight = textureImages[0].naturalHeight * parsedArguments.scale
    const referenceWidth = textureImages[0].naturalWidth * parsedArguments.scale

    const canvasHeight = referenceHeight
    const canvasWidth  =  referenceWidth * textureImages.length

    const canvasResult = Canvas.createCanvas(canvasWidth, canvasHeight)
    const ctx = canvasResult.getContext('2d')
    let textureImage, textureImageData, scale, xOffset, i, r, g, b, a
    for(let texIndex = 0; texIndex < textureImages.length; ++texIndex) {
      // get image
      textureImage = textureImages[texIndex]
      textureImageData = texturesImageData[texIndex]

      scale = Math.floor(referenceWidth / textureImage.naturalWidth)
      xOffset = referenceWidth * texIndex
      for(let x = 0; x < textureImage.naturalWidth; ++x) {
        for(let y = 0; y < textureImage.naturalHeight; ++y) {
          i = (y * textureImage.naturalWidth + x) * 4
          r = textureImageData[i]
          g = textureImageData[i + 1]
          b = textureImageData[i + 2]
          a = textureImageData[i + 3]

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