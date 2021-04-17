const Canvas   = require('canvas')
const Discord  = require('discord.js')
const colors   = require('../res/colors')

const { getMeta }  = require('./getMeta')
const { warnUser } = require('./warnUser')

/**
 * Get an color palette from a image
 * @author Juknum
 * @param {DiscordMessage} message 
 * @param {String} url - Image URL
 * @returns Send an embed message with the color palette of the given URL
 */
async function palette(message, url) {
	getMeta(url).then(async function(dimension) {
		var sizeOrigin = dimension.width * dimension.height

		if (sizeOrigin > 65536) return warnUser(message,'The input picture is too big!')

		var canvas = Canvas.createCanvas(dimension.width, dimension.height).getContext('2d')
		var colorsHEX   = []
		var colorsRGBA  = []

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
				a = image[index + 3]

				var hex = rgbToHex(r,g,b)
				if (!colorsRGBA.includes(`rgba(${r},${g},${b},${a})`)) {
					colorsRGBA.push(`rgba(${r},${g},${b},${a})`)
					colorsHEX.push(hex)
				}
				
			}
		}

		var embed = new Discord.MessageEmbed()
			.setColor(colors.BLUE)
			.setDescription(`List of colors:\n`)
			.setFooter(`Total: ${colorsHEX.length}`)

		var colorsHEXText  = ''
		var i

		for (i = 0; i < colorsHEX.length; i++) {
			if (i < 26) {
				colorsHEXText  += `[\`#${colorsHEX[i]}\`](https://coolors.co/${colorsHEX[i]})\n`
			} else {
				colorsHEXText += '**...**'
				break
			}
		}

		embed.addFields({ name: "Hex:",  value: colorsHEXText,  inline: true })
		
		var URLs = [`https://coolors.co/`,`https://coolors.co/`,`https://coolors.co/`,`https://coolors.co/`]
		for (i = 0; i < colorsHEX.length; i++) {
			if (i <= 9) {
				if (colorsHEX[i].length == 6) URLs[0] += colorsHEX[i] + '-'
				else URLs[0] += colorsHEX[i].slice(0, -2) + '-'
			}
			if (i > 9 && i <= 18) {
				if (colorsHEX[i].length == 6) URLs[1] += colorsHEX[i] + '-'
				else URLs[1] += colorsHEX[i].slice(0, -2) + '-'
			}
			if (i > 18 && i <= 27) {
				if (colorsHEX[i].length == 6) URLs[2] += colorsHEX[i] + '-'
				else URLs[2] += colorsHEX[i].slice(0, -2) + '-'
			}
			if (i > 27 && i <= 36) {
				if (colorsHEX[i].length == 6) URLs[3] += colorsHEX[i] + '-'
				else URLs[3] += colorsHEX[i].slice(0, -2) + '-'
			}
		}

		if (URLs[0] != `https://coolors.co/`){
			for (i = 0; i < URLs.length; i++) {
				if (URLs[i] != `https://coolors.co/`) embed.setDescription(embed.description + `**[Link ${i+1}](${URLs[i].slice(0, -1)})**  `)
			}
			if (colorsHEX.length > 36) {
				embed.setDescription(embed.description + ' **...**')
			}
		}

		const embedMessage = await message.inlineReply(embed)

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
	return (r | 1 << 8).toString(16).slice(1) + (g | 1 << 8).toString(16).slice(1) + (b | 1 << 8).toString(16).slice(1)
}

exports.palette = palette