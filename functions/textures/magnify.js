const Canvas = require('canvas')
const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')

const { MessageAttachment } = require('discord.js');
const { addDeleteReact } = require('../../helpers/addDeleteReact')
const { getMeta } = require('../../helpers/getMeta')

async function magnifyAttachment(url) {
	return getMeta(url)
		.then(async function (dimension) {
			let factor = 64
			const surface = dimension.width * dimension.height

			if (surface == 256) factor = 32
			if (surface > 256) factor = 16
			if (surface > 1024) factor = 8
			if (surface > 4096) factor = 4
			if (surface > 65636) factor = 2
			if (surface > 262144) factor = 1

			const width = dimension.width * factor
			const height = dimension.height * factor
			let canvasResult = Canvas.createCanvas(width, height)
			let canvasResultCTX = canvasResult.getContext('2d')

			const tmp = await Canvas.loadImage(url).catch(err => { console.trace(err); return Promise.reject(err) })
			canvasResultCTX.imageSmoothingEnabled = false
			canvasResultCTX.drawImage(tmp, 0, 0, width, height)

			return new MessageAttachment(canvasResult.toBuffer(), 'magnified.png')
		})
}

/**
 * Magnify image
 * @author Juknum
 * @param {DiscordMessage} message 
 * @param {String} url Image URL
 * @param {DiscordUserID} gotocomplichannel if set, the message is send to the corresponding #complibot
 * @returns Send a message with the magnified image
 */
async function magnify(message, url, gotocomplichannel = undefined, redirectMessage = undefined) {
	const attachment = await magnifyAttachment(url)

	let complichannel
	if (gotocomplichannel) {
		if (message.guild.id == settings.guilds.c32.id) complichannel = message.guild.channels.cache.get(settings.channels.complibot.c32) // C32x discord
		if (message.guild.id == settings.guilds.c64.id) complichannel = message.guild.channels.cache.get(settings.channels.complibot.c64) // C64x discord
		if (message.guild.id == settings.guilds.cextras.id) complichannel = message.guild.channels.cache.get(settings.channels.complibot.cextras) // CExtras discord
	}

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
}

module.exports = {
	magnify: magnify,
	magnifyAttachment: magnifyAttachment,
}