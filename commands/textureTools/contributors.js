const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const fs      = require('fs');
const strings = require('../../res/strings');

const { autoPush } = require('../../functions/autoPush.js');
const { warnUser } = require('../../functions/warnUser.js');
const { jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler');

const NO_TEXTURE_FOUND = -1

module.exports = {
	name: 'contributors',
	aliases: [ 'contributor' ],
	description: strings.HELP_DESC_CONTRIBUTORS,
	guildOnly: false,
	uses: strings.COMMAND_USES_MODS,
	syntax: `${prefix}contributors <add/remove> <path+texture name> <type> <c32/c64> <author>`,

	async execute(client, message, args) {
		// extract args
		const addOrRemove = args[0]
		const pathTexture = args[1]
		let   javaOrBedrock = args[2]
		const packResolution = args[3]
		let   discordTag = args[4]

		// reject if no admin permissions
		if (!message.member.hasPermission('ADMINISTRATOR'))
			return warnUser(message,strings.COMMAND_NO_PERMISSION)

		// update one
		if (addOrRemove !== undefined && addOrRemove === 'update') {
			autoPush('Compliance-Resource-Pack', 'JSON', 'main', `Manual Update executed by: ${message.author.username}`, `./json`)
			return await message.react('✅')
		}

		// verify arguments
		if (args.length !== 5)
			return warnUser(message, strings.CONTRIBUTORS_NOT_ENOUGH_ARGS)

		if (addOrRemove === undefined || (addOrRemove !== 'add' && addOrRemove !== 'remove'))
			return warnUser(message, strings.CONTRIBUTORS_ARG1_INVALID)

		if (javaOrBedrock === undefined || (javaOrBedrock !== 'java' && javaOrBedrock !== 'bedrock'))
			return warnUser(message, strings.CONTRIBUTORS_ARG3_INVALID)
		else
			javaOrBedrock = javaOrBedrock.toLowerCase()

		if (packResolution === undefined || (packResolution !== 'c32' && packResolution !== 'c64'))
			return warnUser(message, strings.CONTRIBUTORs_ARG4_INVALID)

		if (discordTag === undefined || !discordTag.includes('#'))
			return warnUser(message, strings.CONTRIBUTORS_ARG5_INVALID)

		// try to find user
		try {
			const tmpDiscordTag = client.users.cache.find(u => u.tag === discordTag).id
			discordTag = tmpDiscordTag
		} catch(error) {
			return warnUser(message, strings.COMMAND_USER_DOESNT_EXIST)
		}

		// will be used later
		let textures
		let textureFileHandle

		let textureIndex = NO_TEXTURE_FOUND
		let i = 0
		
		if (javaOrBedrock === 'java') {
			textureFileHandle = jsonContributionsJava
			textures = await textureFileHandle.read()

			while (i < textures.length && textureIndex == NO_TEXTURE_FOUND) {
				if (textures[i].version[strings.LATEST_MC_JE_VERSION].includes(pathTexture))
					textureIndex = i
				++i
			}
		} else {
			textureFileHandle.release()
			textureFileHandle = jsonContributionsBedrock
			textures = await textureFileHandle.read()

			// find texture index
			while (i < textures.length && textureIndex == NO_TEXTURE_FOUND) {
				if (textures[i].version[strings.LATEST_MC_BE_VERSION].includes(pathTexture))
					textureIndex = i
				++i
			}
		}

		// I am using a try catch statement because much more flexible in case of errors
		try {
			// check texture index
			if (textureIndex === NO_TEXTURE_FOUND)
				throw strings.CONTRIBUTORS_UNKNOWN_TEXTURE

			if (addOrRemove === 'add') {
				// create author array if not defined else append
				if (textures[textureIndex][packResolution].author == undefined) {
					textures[textureIndex][packResolution].author = [discordTag]
				}
				else if (!textures[textureIndex][packResolution].author.includes(discordTag)) {
					textures[textureIndex][packResolution].author.push(discordTag)
				}
			}

			else {
				// warn user if no author to remove
				if (textures[textureIndex][packResolution].author == undefined)
					throw strings.CONTRIBUTORS_TEXTURE_NO_AUTHOR
				
				// warn if user not in this texture
				if(!textures[textureIndex][packResolution].author.includes(discordTag))
					throw strings.CONTRIBUTORS_AUTHOR_DOESNT_EXIST
				
				// remove this bad boy
				if (textures[textureIndex][packResolution].author.length > 1)
					textures[textureIndex][packResolution].author = textures[textureIndex][packResolution].author.filter(item => item !== discordTag)
				else
					textures[textureIndex][packResolution] =  {}
			}
			
			// else it is removed

			// write and release
			await textureFileHandle.write(textures)

			// react
			return await message.react('✅')
		} catch (error) {
			// release 
			textureFileHandle.release()

			// and throw error
			return warnUser(message, error.toString())
		}
	}
}
