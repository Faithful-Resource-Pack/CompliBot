const Canvas  = require('canvas')
const Discord = require('discord.js');
const { addDeleteReact } = require('../../helpers/addDeleteReact');

const { getMeta }  = require('../../helpers/getMeta')
const { warnUser } = require('../../helpers/warnUser')
const { magnify }  = require('./magnify');

/**
 * Tile an image
 * @author Juknum
 * @param {DiscordMessage} message 
 * @param {String} url Image url
 * @param {String} type Type of tiling, could be: grid, horizontal, round or plus
 * @returns Send an embed message with the tiled image
 */
function tile(message, url, type) {
	getMeta(url).then(async function(dimension) {
		// aliases of type
		if (type == undefined || type == 'g') type = 'grid'
		if (type =='v') type = 'vertical'
		if (type == 'h') type = 'horizontal'
		if (type == 'r') type = 'round'
		if (type == 'p') type = 'plus'

		var sizeResult = (dimension.width * dimension.height) * 3
		if (sizeResult > 262144) return warnUser(message, 'The output picture will be too big!\nMaximum output allowed: 512 x 512 px²\nYours is: ' + dimension.width * 3 + ' x ' + dimension.height * 3 + ' px²')
		
		let canvas
		let canvasContext
		let i, j
		
		/**
		 * Follows this pattern:
		 *  x x x
		 *  x x x
		 *  x x x
		 */
		if (type == 'grid') {
			canvas = Canvas.createCanvas(dimension.width * 3, dimension.height * 3)
			canvasContext = canvas.getContext('2d')

			const temp = await Canvas.loadImage(url)
			for (i = 0; i < 3; i++) {
				for (j = 0; j < 3; j++) {
					canvasContext.drawImage(temp, i * dimension.width, j * dimension.height)
				}
			}
		}

		/**
		 * Follows this pattern:
		 *  . x .
		 *  . x .
		 *  . x .
		 */
		else if (type == 'vertical') {
			canvas = Canvas.createCanvas(dimension.width, dimension.height * 3)
			canvasContext = canvas.getContext('2d')

			const temp = await Canvas.loadImage(url)
			for (i = 0; i < 3; i++) {
				for (j = 0; j < 3; j++) {
					canvasContext.drawImage(temp, i * dimension.width, j * dimension.height)
				}
			}
		}

		/**
		 * Follows this pattern:
		 *  . . .
		 *  x x x
		 *  . . .
		 */
		else if (type == 'horizontal') {
			canvas = Canvas.createCanvas(dimension.width * 3, dimension.height)
			canvasContext = canvas.getContext('2d')

			const temp = await Canvas.loadImage(url)
			for (i = 0; i < 3; i++) {
				for (j = 0; j < 3; j++) {
					canvasContext.drawImage(temp, i * dimension.width, j * dimension.height)
				}
			}
		}

		/**
		 * Follows this pattern:
		 *  x x x
		 *  x . x
		 *  x x x
		 */
		else if (type == 'round') {
			canvas = Canvas.createCanvas(dimension.width * 3, dimension.height * 3)
			canvasContext = canvas.getContext('2d')

			const temp = await Canvas.loadImage(url)
			for (i = 0; i < 3; i++) {
				for (j = 0; j < 3; j++) {
					canvasContext.drawImage(temp, i * dimension.width, j * dimension.height)
				}
			}
			canvasContext.clearRect(dimension.width, dimension.height, dimension.width, dimension.height)
		}

		/**
		 * Follows this pattern:
		 *  . x .
		 *  x x x
		 *  . x .
		 */
		else if (type == 'plus') {
			canvas = Canvas.createCanvas(dimension.width * 3, dimension.height * 3)
			canvasContext = canvas.getContext('2d')

			const temp = await Canvas.loadImage(url)
			for (i = 0; i < 3; i++) {
				for (j = 0; j < 3; j++) {
					canvasContext.drawImage(temp, i * dimension.width, j * dimension.height)
				}
			}
			canvasContext.clearRect(0, 0, dimension.width, dimension.height) // top left
			canvasContext.clearRect(dimension.width * 2, 0, dimension.width, dimension.height) // top right
			canvasContext.clearRect(dimension.width * 2, dimension.height * 2, dimension.width, dimension.height) // bottom right
			canvasContext.clearRect(0, dimension.height * 2, dimension.width, dimension.height) // bottom left
		}

		const attachment   = new Discord.MessageAttachment(canvas.toBuffer(), 'tiled.png')
		const embedMessage = await message.inlineReply(attachment)
		addDeleteReact(embedMessage, message)

		if (dimension.width <= 512 && dimension.height <= 512) {
			embedMessage.react('🔎');

			const filter = (reaction, user) => {
				return ['🔎'].includes(reaction.emoji.name) && user.id === message.author.id
			}

			embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
				.then(async collected => {
					const reaction = collected.first()
					if (reaction.emoji.name === '🔎') {
						return magnify(embedMessage, embedMessage.attachments.first().url)
					}
				})
				.catch(async () => {
					try {
						if (message.channel.type !== 'dm') await embedMessage.reactions.cache.get('🔎').remove()
					} catch (err) { /* Message already deleted */ }
				})
		}
	})
}

exports.tile = tile