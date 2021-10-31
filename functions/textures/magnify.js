const Canvas = require('canvas')
const Discord = require('discord.js')
const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')

const { addDeleteReact } = require('../../helpers/addDeleteReact')
const { getMeta } = require('../../helpers/getMeta')
const { warnUser } = require('../../helpers/warnUser')

/**
 * Magnify image
 * @author Juknum
 * @param {DiscordMessage} message 
 * @param {String} url Image URL
 * @param {DiscordUserID} gotocomplichannel if set, the message is send to the corresponding #complibot
 * @returns Send a message with the magnified image
 */
function magnify(message, url, gotocomplichannel = undefined, redirectMessage = undefined) {

	let complichannel
	if (gotocomplichannel) {
		if (message.guild.id == settings.guilds.c32.id) complichannel = message.guild.channels.cache.get(settings.channels.complibot.c32) // C32x discord
		if (message.guild.id == settings.guilds.c64.id) complichannel = message.guild.channels.cache.get(settings.channels.complibot.c64) // C64x discord
		if (message.guild.id == settings.guilds.cextras.id) complichannel = message.guild.channels.cache.get(settings.channels.complibot.cextras) // CExtras discord
	}

	getMeta(url).then(async function (dimension) {
		var sizeOrigin = dimension.width * dimension.height
		var factor = 64

		if (sizeOrigin == 256) factor = 32
		if (sizeOrigin > 256) factor = 16
		if (sizeOrigin > 1024) factor = 8
		if (sizeOrigin > 4096) factor = 4
		if (sizeOrigin > 65636) factor = 2
		if (sizeOrigin > 262144) return warnUser(message, strings.command.image.too_big)

		var width = dimension.width * factor
		var height = dimension.height * factor
		var canvasResult = Canvas.createCanvas(width, height)
		var canvasResultCTX = canvasResult.getContext('2d')

		const temp = await Canvas.loadImage(url).catch(error => { console.trace(error); return Promise.reject(error); })
		canvasResultCTX.imageSmoothingEnabled = false
		canvasResultCTX.drawImage(temp, 0, 0, width, height)

		const attachment = new Discord.MessageAttachment(canvasResult.toBuffer(), 'magnified.png');

		let embedMessage
		if (gotocomplichannel) {
			try {
				const member = await message.guild.members.cache.get(gotocomplichannel)
				embedMessage = await member.send({ files: [attachment] });
			} catch (e) {
				embedMessage = await complichannel.send({ content: `<@!${gotocomplichannel}>`, files: [attachment] });
			}
		}
		else embedMessage = await message.reply({ files: [attachment] });

		if (redirectMessage) addDeleteReact(embedMessage, redirectMessage, true)
		else addDeleteReact(embedMessage, message, true)

		return attachment;
	});
}

exports.magnify = magnify;
