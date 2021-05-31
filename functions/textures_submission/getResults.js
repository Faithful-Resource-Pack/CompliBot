/*eslint-env node*/

const Discord  = require('discord.js')
const settings = require('../../ressources/settings')
const colors   = require('../../ressources/colors')
const strings  = require('../../ressources/strings')
const fs       = require('fs')
const fetch    = require('node-fetch')

const DEBUG = (process.env.DEBUG == 'true')

//const { date } = require('../utility/date')
const { getMessages } = require('../getMessages')
const { jsonContributionsBedrock, jsonContributionsJava } = require('../../helpers/fileHandler')

/**
 * Check if embed messages use green color and download image attached if true.
 * @param {Discord} client Discord Client
 * @param {String} inputID Discord Channel ID (Input)
 * @param {Number} OFFSET_DAY Number of day since the message have been posted
 */
async function getResults(client, inputID, OFFSET_DAY = 0) {
	const messages = await getMessages(client, inputID, 200)

	// used for dev
	var offsetDate = new Date()
			offsetDate.setDate(offsetDate.getDate() - OFFSET_DAY)

	for (const index in messages) {
		var message     = messages[index]
		var messageDate = new Date(message.createdTimestamp)
	
		var isGoodDate     = (messageDate.getDate()  == offsetDate.getDate() && messageDate.getMonth() == offsetDate.getMonth())
		var isMessageEmbed = (message.embeds[0] != undefined)
		var isGoodColor    = (isMessageEmbed && message.embeds[0].color == 5025616)

		var textureAuthor   = undefined
		//var textureCoAuthor = []
		var textureName     = undefined
		var textureType     = undefined
		var texturePath     = undefined
		var textureSize     = undefined
		var textureIndex    = -1

		if (isGoodDate) {
			if (isMessageEmbed && isGoodColor) {

				textureName = message.embeds[0].fields[0].value.replace('.png', '') + '.png' || null
				texturePath = message.embeds[0].fields[1].value || null
				textureType = message.embeds[0].fields[2].value || null

				let folder   = undefined
				let search   = undefined
				let textures = undefined

				if (textureType == 'java') {
					textures = await jsonContributionsJava.read()

					if (texturePath.includes('realms')) {
						folder = texturePath.replace('realms/textures/', '')
						search = `realms/textures/${folder}/${textureName}`
					}
					else {
						folder = texturePath.replace('minecraft/textures/', '')
						search = `minecraft/textures/${folder}/${textureName}`
					}

					for (let l = 0; l < textures.length; l++) {
						if (textures[l].version[strings.LATEST_MC_JE_VERSION].includes(search)) {
							textureIndex = l
							
							if (inputID == settings.C32_RESULTS) textureSize = 32
							else if (inputID == settings.C64_RESULTS) textureSize = 64
							else textureSize = null

							break
						}
					}

					jsonContributionsJava.release()
				}
				else if (textureType == 'bedrock') {
					textures = await jsonContributionsBedrock.read()

					folder = texturePath.replace('textures/', '')
					search = `textures/${folder}/${textureName}`

					for (let l = 0; l < textures.length; l++) {
						if (textures[l].version[strings.LATEST_MC_BE_VERSION].includes(search)) {
							textureIndex = l

							if (inputID == settings.C32_RESULTS) textureSize = 32
							else if (inputID == settings.C64_RESULTS) textureSize = 64
							else textureSize = null

							break
						}
					}

					jsonContributionsBedrock.release()
				}
				else errorgithubPush(client, inputID, message, textureAuthor, textureName, texturePath, textureType, strings.AUTOPUSH_ERROR_TYPE)

				if (textureIndex == -1 && (textureType == 'java' || textureType == 'bedrock')) {
					if (DEBUG) console.log(`\nTEXTURE NOT FOUND: ${textureName}`)
					errorgithubPush(client, inputID, message, textureAuthor, textureName, texturePath, textureType, strings.AUTOPUSH_ERROR_SPELLING)
				}
				else if (textureIndex != -1 && (textureType == 'java' || textureType == 'bedrock')) {

					// Convert the texture to bedrock if available
					let texturesJava    = await jsonContributionsJava.read()
					let texturesBedrock = await jsonContributionsBedrock.read()

					if (textureType == 'java' && texturesJava[textureIndex].isBedrock) {
						let search = texturesJava[textureIndex].bedrock[strings.LATEST_MC_BE_VERSION]

						// Search the corresponding texture inside bedrock.json
						for (let b = 0; b < texturesBedrock.length; b++) {
							if (texturesBedrock[b].version[strings.LATEST_MC_BE_VERSION].includes(search)) {
								await download_branch(client, message.embeds[0].image.url, texturesBedrock[b].version['1.16.210'], textureSize, textureName, '1.16.210', 'bedrock')
								break
							}
						}
					}

					if (textureType == 'java') {
						if (DEBUG) console.log(`\nADDING: ${textureName}`)
						await download_branch(client, message.embeds[0].image.url, texturesJava[textureIndex].version['1.17'], textureSize, textureName, '1.17', 'java')
						await download_branch(client, message.embeds[0].image.url, texturesJava[textureIndex].version['1.16.5'], textureSize, textureName, '1.16.5', 'java')
						await download_branch(client, message.embeds[0].image.url, texturesJava[textureIndex].version['1.15.2'], textureSize, textureName, '1.15.2', 'java')
						await download_branch(client, message.embeds[0].image.url, texturesJava[textureIndex].version['1.14.4'], textureSize, textureName, '1.14.4', 'java')
						await download_branch(client, message.embeds[0].image.url, texturesJava[textureIndex].version['1.13.2'], textureSize, textureName, '1.13.2', 'java')
						await download_branch(client, message.embeds[0].image.url, texturesJava[textureIndex].version['1.12.2'], textureSize, textureName, '1.12.2', 'java')
					}
					else if (textureType == 'bedrock') {
						if (DEBUG) console.log(`\nADDING: ${textureName}`)
						await download_branch(client, message.embeds[0].image.url, texturesBedrock[textureIndex].version['1.16.210'], textureSize, textureName, '1.16.210', 'bedrock')
					}

					jsonContributionsJava.release()
					jsonContributionsBedrock.release()
					
					//await setAuthor(textureType, textureIndex, textureAuthor, textureCoAuthor, textureSize)
					//console.log(textureType, textureAuthor, textureCoAuthor, textureName, texturePath, textureSize, textureIndex)
				}
			}
		}
	}

	console.log('END')
}

async function download_branch(client, textureURL, texturePath, textureSize, textureName, branch, type) {
	if (texturePath == null || texturePath == undefined) return

	var localPath = undefined
	if (textureSize == 32 && type == 'java') localPath = `./texturesPush/Compliance-Java-32x/${branch}/assets/${texturePath}`
	else if (textureSize == 64 && type == 'java') localPath = `./texturesPush/Compliance-Java-64x/${branch}/assets/${texturePath}`
	else if (textureSize == 32 && type == 'bedrock') localPath = `./texturesPush/Compliance-Bedrock-32x/${branch}/${texturePath}`
	else if (textureSize == 64 && type == 'bedrock') localPath = `./texturesPush/Compliance-Bedrock-64x/${branch}/${texturePath}`

	else if (localPath == undefined) {
		return errorgithubPush(client, 0, 'localPath undefined', textureURL, textureName, texturePath, textureSize, 'localPath == undefined')
	}

	const response = await fetch(textureURL)
	const buffer = await response.buffer()
	await fs.promises.mkdir(localPath.substr(0, localPath.lastIndexOf('/')), { recursive: true }).catch(console.error)
	await fs.writeFile(localPath, buffer, function (err) {
		if (err) return console.error(err)
		else return console.log(`ADDED TO: ${localPath}`)
	})
}

async function errorgithubPush(client, inputID, message, author, name, folder, type, error) {
	var errorChannel = client.channels.cache.get(settings.C32_githubPush_FAIL)
	if (inputID == settings.C64_RESULTS) errorChannel = client.channels.cache.get(settings.C64_githubPush_FAIL)

	var embed = new Discord.MessageEmbed()
		.setColor(colors.YELLOW)
		.setAuthor(author, message.embeds[0].author.iconURL)
		.setDescription(`Something went wrong during githubPush:\nError: ${error}`)
		.addFields(
			{ name: 'Name:', value: name, inline: true },
			{ name: 'Folder:', value: folder, inline: true },
			{ name: 'Type:', value: type, inline: true }
		)

	if (message.embeds[0].title) {
		embed.setTitle(message.embeds[0].title).setURL(message.embeds[0].url)
	}
	else embed.setImage(message.embeds[0].image.url)

	await errorChannel.send(embed)
}
/*
async function setAuthor(valType, valIndex, valAuth, valCoAuth = [], valSize) {
	// If the author is not already in co-authors
	if (valCoAuth[0] && !valCoAuth.includes(valAuth)) valCoAuth.push(valAuth)
	// If co-authors is empty
	else if (!valCoAuth[0]) valCoAuth = [valAuth]
	// If co-authors already have the author: do nothing
	// else if (valCoAuth[0] && valCoAuth.includes(valAuth))

	let fileHandle
	let textures

	if (valType == 'java') fileHandle = jsonContributionsJava
	if (valType == 'bedrock') fileHandle = jsonContributionsBedrock

	textures = await fileHandle.read()

	if (valSize == 32) {
		textures[valIndex].c32.date = date()
		textures[valIndex].c32.author = valCoAuth
		if (DEBUG) console.log(`ADD ${valCoAuth} AS 32x AUTHOR OF ${valType}`)
	}
	if (valSize == 64) {
		textures[valIndex].c64.date = date()
		textures[valIndex].c64.author = valCoAuth
		if (DEBUG) console.log(`ADD ${valCoAuth} AS 64x AUTHOR OF ${valType}`)
	}

	if (valType == 'java') await jsonContributionsJava.write(textures)
	if (valType == 'bedrock') await jsonContributionsBedrock.write(textures)

	fileHandle.release()

	if (valType == 'java' && textures[valIndex].isBedrock) {
		let found = false
		let index = -1

		fileHandle = jsonContributionsBedrock
		var texturesBedrock = await fileHandle.read()

		for (var i in texturesBedrock) {
			if (texturesBedrock[i].version[strings.LATEST_MC_BE_VERSION].includes(textures[valIndex].bedrock[strings.LATEST_MC_BE_VERSION])) {
				found = true
				index = i
			}
		}

		if (found) {
			fileHandle.release()
			await setAuthor('bedrock', index, valAuth, valCoAuth, valSize)
		}
	}

	return
}
*/
exports.getResults = getResults