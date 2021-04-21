const Canvas   = require('canvas')
const Discord  = require('discord.js')

const { getMeta }  = require('./getMeta')
const { warnUser } = require('./warnUser')

const COLORS_PER_PALETTE = 9
const COLORS_PER_PALETTE_LINE = 3

const COLORS_TOP = COLORS_PER_PALETTE * 6

const GRADIENT_WIDTH = 700
const GRADIENT_BAND_WIDTH = 3
const GRADIENT_HEIGHT = 50

/**
 * Get an color palette from a image
 * @author Juknum
 * @param {Discord.Message} message 
 * @param {String} url - Image URL
 * @returns Send an embed message with the color palette of the given URL
 */
async function palette(message, url) {
	getMeta(url).then(async function(dimension) {
		var sizeOrigin = dimension.width * dimension.height

		if (sizeOrigin > 65536) return warnUser(message, 'The input picture is too big!')

		var canvas = Canvas.createCanvas(dimension.width, dimension.height).getContext('2d')
		const allColors = {}

		const temp = await Canvas.loadImage(url)
		canvas.drawImage(temp, 0, 0)

		var image = canvas.getImageData(0, 0, dimension.width, dimension.height).data

		let index, r, g, b, a
		var x, y

		for (x = 0; x < dimension.width; x++) {
			for (y = 0; y < dimension.height; y++) {
				index = (y * dimension.width + x) * 4
				r = image[index]
				g = image[index + 1]
				b = image[index + 2]
				a = image[index + 3] / 255

				// avoid transparent colors
				if(a !== 0) {
					var hex = rgbToHex(r,g,b)
					if(!(hex in allColors))
					allColors[hex] = { hex: hex, opacity: [], rgb:[r, g, b], count: 0}
					++allColors[hex].count
					allColors[hex].opacity.push(a)
				}
			}
		}
		// convert back to array
		let colors = Object.values(allColors).sort((a, b) => b.count - a.count).slice(0, COLORS_TOP)
		colors = colors.map(el => el.hex)

		// object trick so no duplicates

		var embed = new Discord.MessageEmbed()
			.setTitle('Palette results')
			.setColor(colors.BLUE)
			.setDescription(`List of colors:\n`)
			.setFooter(`Total: ${Object.values(allColors).length}`)

		const field_groups = []
		let i
		for (i = 0; i < colors.length; i++) {
			// create 9 group
			if(i % COLORS_PER_PALETTE === 0) {
				field_groups.push([])
				g = 0
			}

			// each groups has 3 lines
			if(g % COLORS_PER_PALETTE_LINE === 0) {
				field_groups[field_groups.length - 1].push([])
			}

			// add color to latest group latest line
			field_groups[field_groups.length - 1][field_groups[field_groups.length - 1].length - 1].push(colors[i])

			++g
		}
		
		let groupValue
		field_groups.forEach((group, index) => {
			groupValue = group.map(line => line.map(color => `[\`${color}\`](https://coolors.co/${color})`).join(' ')).join(' ')
			embed.addFields({ name: "Hex" + ((field_groups.length > 1) ? ` part ${ (index + 1) }` : '') + ': ',  value: groupValue,  inline: true })
		})
		
		// create palette links, 9 max per link

		// make arrays of hex arrays
		const palette_groups = []
		for(i = 0; i < colors.length; ++i) {
			if(i % COLORS_PER_PALETTE === 0) {
				palette_groups.push([])
			}
			palette_groups[palette_groups.length - 1].push(colors[i].replace('#', ''))
		}

		// create urls
		const COOLORS_URL = 'https://coolors.co/'
		const palette_urls = []
		let descriptionLength = embed.description.length
		
		i = 0
		let stayInLoop = true
		let link
		while(i < palette_groups.length && stayInLoop) {
			link = `**[Palette${ palette_groups.length > 1 ? ' part ' + (i+1) : ''}](${COOLORS_URL}${palette_groups[i].join('-')})** `

			if(descriptionLength + link.length + 3 > 1024) {
				stayInLoop = false
			} else {
				palette_urls.push(link)
				descriptionLength += link.length
			}
			++i
		}

		// add generate palette links
		const finalDescription = embed.description + palette_urls.join(' - ')

		// append palettes to description
		embed.setDescription(finalDescription)

		// create gradient canvas for top 250 colors
		const bandWidth = Object.values(allColors).length > 250 ? GRADIENT_BAND_WIDTH : Math.floor(GRADIENT_WIDTH / Object.values(allColors).length)
		// compute width
		const allColorsSorted = Object.values(allColors).sort((a, b) => b.count - a.count).slice(0, 250).sort((a, b) => {
			const [ha, la, va] = step(a.rgb[0], a.rgb[1], a.rgb[2], 8)
			const [hb, lb, vb] = step(b.rgb[0], b.rgb[1], b.rgb[2], 8)

			if(ha > hb)
				return 1
			else if(ha < hb)
				return -1
			else if(la > lb)
				return 1
			else if(la < lb)
				return -1
			else if(va > vb)
				return 1
			else if(va < vb)
				return -1

			return 0
		})

		const canvasWidth = bandWidth * allColorsSorted.length
		const colorCanvas = Canvas.createCanvas(canvasWidth, GRADIENT_HEIGHT)
		const ctx = colorCanvas.getContext('2d')

		allColorsSorted.forEach((color, index) => {
			ctx.fillStyle = color.hex
			ctx.globalAlpha = color.opacity.reduce((a,v,i)=>(a*i+v)/(i+1)) // average alpha
			ctx.fillRect(bandWidth * index, 0, bandWidth, GRADIENT_HEIGHT)
		})

		// create the attachement
		const colorImageAttachment = new Discord.MessageAttachment(colorCanvas.toBuffer(), 'colors.png');

		const embedMessage = await message.reply({
			embed: embed,
			files: [colorImageAttachment]
		})

		if (message.channel.type !== 'dm')  await embedMessage.react('🗑️')

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
				if (message.channel.type !== 'dm')  await embedMessage.reactions.cache.get('🗑️').remove()
			})
	})
}

function rgbToHex(r,g,b) {
	return '#' + ((r | 1 << 8).toString(16).slice(1) + (g | 1 << 8).toString(16).slice(1) + (b | 1 << 8).toString(16).slice(1))
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
 function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}

function step(r, g, b, repetitions=1) {
	const lum = Math.sqrt( .241 * r + .691 * g + .068 * b )
	// eslint-disable-next-line no-unused-vars
	const [h, s, v] = rgbToHsv(r, g, b)

	let h2, v2
	h2 = Math.floor(h * repetitions)
	v2 = Math.floor(v * repetitions)

	if(h2 % 2 == 1) {
		v2 = repetitions - v2
	}

	return [h2, lum, v2]
}

exports.palette = palette