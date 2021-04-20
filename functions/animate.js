const Canvas     = require('canvas')
const Discord    = require('discord.js')
const GIFEncoderFixed = require('../modified_libraries/GIFEncoder.js')

const { getMeta }  = require('./getMeta')
const { warnUser } = require('./warnUser')

// "magnify" the output GIF (the output will be to small)
var FACTOR = 8

/**
 * Convert Image to GIF following MCMETA file
 * @param {DiscordMessage} message Discord message
 * @param {Object} valMCMETA MCMETA object
 * @param {String} valURL Image URL
 */
async function animate(message, valMCMETA, valURL) {

	let texture = []

	getMeta(valURL).then(async function(dimension) {
		if (dimension.width == dimension.height) return warnUser(message, 'This texture can\'t be animated.')
		if (dimension.width * FACTOR > 4096) return warnUser(message, 'This texture is too wide.')
		if (dimension.width * FACTOR > 1024) FACTOR = 1

		texture.canvas = await sizeUP(valURL, dimension)
		texture.width  = dimension.width * FACTOR
		texture.height = dimension.height * FACTOR

		// NOTE: Width & Height properties from MCMETA aren't supported

		let canvas  = Canvas.createCanvas(texture.width, texture.width)
		let context = canvas.getContext('2d')

		let MCMETA = typeof valMCMETA === 'object' ? valMCMETA : { animation: {} }
		if (!MCMETA.animation) MCMETA.animation = {}

		// Initialization:
		let frametime = MCMETA.animation.frametime || 1
		let frames    = []

		// MCMETA.animation.frames is defined
		if (Array.isArray(MCMETA.animation.frames) && MCMETA.animation.frames.length > 0) {
			for (let i = 0; i < MCMETA.animation.frames.length; i++) {
				const frame = MCMETA.animation.frames[i]

				if (typeof frame === 'number') {
					frames.push({
						index:    frame,
						duration: frametime
					})
				}
				else if (typeof frame === 'object') {
					frames.push({
						index: frame.index || i,
						duration: frame.time || frametime
					})
				}
				// If wrong frames support is given
				else {
					frames.push({
						index:    i,
						duration: frametime
					})
				}
			}
		}
		// MCMETA.animation.frames is not defined
		else {
			for (let i = 0; i < texture.height / texture.width; i++) {
				frames.push({
					index:    i,
					duration: frametime
				})
			}
		}

		// Draw frames:
		const encoder = new GIFEncoderFixed(texture.width, texture.width)
		encoder.start()
		encoder.setTransparent(true)

		context.globalCompositeOperation = 'copy'

		if (MCMETA.animation.interpolate) {
			let ratio = 0

			let limit = frametime
			if (limit >= 100) limit /= 10

			for (let i = 0; i < frames.length; i++) {
				for (let y = 1; y <= limit; y++) {
					context.clearRect(0, 0, canvas.width, canvas.height)
					context.imageSmoothingEnabled = texture.width > canvas.width
					context.globalAlpha = 1

					// frame i (always 100%)
					context.drawImage(
						texture.canvas, 										// image
						0, texture.width * frames[i].index, // sx, sy
						texture.width, texture.width,			  // sWidth, sHeight
						0, 0,															  // dx, dy
						canvas.width, canvas.height					// dWidth, dHeight
					)

					ratio = (100 / frametime) * y
					context.globalAlpha = ratio / 100

					// frame i + 1 (follow the ratio)
					context.drawImage(
						texture.canvas,																						// image
						0, texture.width * frames[(i + 1) % frames.length].index, // sx, sy
						texture.width, texture.width,															// sWidth, sHeight
						0, 0,																											// dx, dy
						canvas.width, canvas.height																// dWidth, dHeight
					)

					if (limit == frametime) encoder.setDelay(50) // frames count == frametime -> time of 1 frame == 1 tick -> 50ms
					else encoder.setDelay(500)
					encoder.addFrame(context)
				}
			}
		}
		else {
			for (let i = 0; i < frames.length; i++) {
				context.clearRect(0, 0, canvas.width, canvas.height)
				context.imageSmoothingEnabled = texture.width > canvas.width
				context.globalAlpha = 1

				// see: https://media.prod.mdn.mozit.cloud/attachments/2012/07/09/225/46ffb06174df7c077c89ff3055e6e524/Canvas_drawimage.jpg
				context.drawImage(
					texture.canvas, 										// image
					0, texture.width * frames[i].index, // sx, sy
					texture.width, texture.width,			  // sWidth, sHeight
					0, 0,															  // dx, dy
					canvas.width, canvas.height					// dWidth, dHeight
				)

				encoder.setDelay(50 * frames[i].duration)
				encoder.addFrame(context)
			}
		}

		encoder.finish()

		// Send result:
		const attachment = new Discord.MessageAttachment(encoder.out.getData(), 'output.gif')

		await message.inlineReply(attachment)
	})
}

/**
 * Magnify image Canvas before making the GIF
 * @param {String} valURL Image URL
 * @param {Object} dimension dimension: {width, height}
 * @returns a sized up Canvas Context
 */
async function sizeUP(valURL, dimension) {
	let contextIN  = Canvas.createCanvas(dimension.width, dimension.height).getContext('2d')
	let canvasOUT  = Canvas.createCanvas(dimension.width * FACTOR, dimension.height * FACTOR)
	let contextOUT = canvasOUT.getContext('2d')

	let temp = await Canvas.loadImage(valURL)
	contextIN.drawImage(temp, 0, 0)
	let image = contextIN.getImageData(0, 0, dimension.width, dimension.height).data

	let i, r, g, b, a

	for (var x = 0; x < dimension.width; x++) {
		for (var y = 0; y < dimension.height; y++) {
			i = (y * dimension.width + x) * 4
			r = image[i]
			g = image[i+1]
			b = image[i+2]
			a = image[i+3]

			contextOUT.fillStyle = `rgba(${r},${g},${b},${a})`
			contextOUT.fillRect(x * FACTOR, y * FACTOR, FACTOR, FACTOR)
		}
	}

	return canvasOUT
}

exports.animate = animate