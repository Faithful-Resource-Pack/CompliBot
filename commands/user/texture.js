/*eslint-env node*/
const prefix = process.env.PREFIX

const Discord     = require('discord.js')
const axios       = require('axios').default
const strings     = require('../../resources/strings')
const colors      = require('../../resources/colors')
const settings    = require('../../resources/settings')
const emojis      = require('../../resources/emojis')
const choiceEmbed = require('../../helpers/choiceEmbed')

const { magnify }  = require('../../functions/textures/magnify')
const { palette }  = require('../../functions/textures/palette')
const { tile }     = require('../../functions/textures/tile');
const { getMeta }  = require('../../helpers/getMeta')
const { warnUser } = require('../../helpers/warnUser')
const { timestampConverter } = require ('../../helpers/timestampConverter')
const { addDeleteReact } = require('../../helpers/addDeleteReact')

const allowed = ['vanilla', '16', '32', '64'];
const used = ['16', '32', '64'];

module.exports = {
	name: 'texture',
	aliases: ['textures'],
	description: strings.HELP_DESC_TEXTURE,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}texture <16/32/64> <texture_name>\n${prefix}texture <16/32/64> <_name>\n${prefix}texture <16/32/64> </folder/>`,
	example: `${prefix}texture 16 dirt`,

	/**
	 * @param {Discord.Client} client The discord boi client
	 * @param {Discord.Message} message The incoming message to respond to
	 * @param {Array<string>} args All words following the command
	 */
	async execute(client, message, args) {

		let results    = []
		const textures = require('../../helpers/firestorm/texture')
		const paths    = require('../../helpers/firestorm/texture_paths')

		// no args given
		if (args == '') return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN)

		let res    = args[0]
		let search = args[1]

		// no valids args given
		if (!allowed.includes(args[0])) return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN)
		// no search field given
		if (!args[1]) return warnUser(message, strings.COMMAND_NOT_ENOUGH_ARGUMENTS_GIVEN)
		else args[1] = String(args[1])

		// universal args
		if (args[0].includes('16') || args[0] === 'vanilla') res = '16'
		if (args[0].includes('32')) res = '32'
		if (args[0].includes('64')) res = '64'

		/*var waitEmbed = new Discord.MessageEmbed()
			.setTitle('Loading')
			.setDescription(strings.COMMAND_SEARCHING_FOR_TEXTURE)
			.setThumbnail(settings.LOADING_IMG)
			.setColor(colors.BLUE)
		const waitEmbedMessage = await message.reply({embeds: [waitEmbed]});*/

		// partial texture name (_sword, _axe -> diamond_sword, diamond_axe...)
		if (search.startsWith('_') || search.endsWith('_')) {
			try {
				results = await textures.search([{
					field: "name",
					criteria: "includes",
					value: search
				}])
			}
			catch (err) { return warnUser(message, err) }
		}
		// looking for path + texture (block/stone -> stone)
		else if (search.startsWith('/') || search.endsWith('/')) {
			try {
				results = await paths.search([{
					field: "path",
					criteria: "includes",
					value: search
				}])
			}
			catch (err) { return warnUser(message, err) }

			// transform paths results into textures
			let output = new Array()
			for (let i = 0; results[i]; i++) {
				let texture
				try {
					let use = await results[i].use()
					texture = await textures.get(use.textureID)
				} catch (err) { return warnUser(message, err) }
				output.push(texture)
			}
			results = output
		}
		// looking for all exact matches (stone -> stone.png)
		else {
			try {
				results = await textures.search([{
					field: "name",
					criteria: "==",
					value: search
				}])
			} catch (err) { return warnUser(message, err) }

			if (results.length == 0) {
				// no equal result, searching with includes
				try {
					results = await textures.search([{
						field: "name",
						criteria: 'includes',
						value: search
					}])
				} catch (err) { return warnUser(message, err) }
			}
		}

		if (results.length > 1) {

			let choice = [];
			
			for (let i = 0; results[i]; i++) {
				let uses = await results[i].uses()
				let stringBuilder = []

				for (let j = 0; uses[j]; j++) {
					let paths = await uses[j].paths()
					for (let k = 0; paths[k]; k++) {
						if (paths[k].versions.length > 1) stringBuilder.push(`\`[${paths[k].versions[paths[k].versions.length - 1]}+]\`\t${paths[k].path.replace(search, `**${search}**`).replace(/_/g, '\\_')}`)
						else stringBuilder.push(`\`[${paths[k].versions[0]}]\`\t${paths[k].path.replace(search, `**${search}**`).replace(/_/g, '\\_')}`)
					}
				}

				choice.push(
					`\`[#${results[i].id}]\` ${results[i].name.replace(search, `**${search}**`).replace(/_/g, '\\_')}
					> ${stringBuilder.join('\n> ')}\n`
				)
			}

			//if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete();
			choiceEmbed(message, {
				title: `${results.length} results, react to choose one!`,
				description: strings.TEXTURE_SEARCH_DESCRIPTION,
				footer: `${message.client.user.username}`,
				propositions: choice
			})
			.then(choice => {
				return getTexture(message, res, results[choice.index])
			})
			.catch((message, error) => {
				if (process.env.DEBUG) console.error(message, error)
			})
		}
		else if (results.length == 1) {
			await getTexture(message, res, results[0])
			//if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete();
		}
		else {
			await warnUser(message, strings.TEXTURE_DOESNT_EXIST)
			//if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete();
		}
	}
}

/**
 * TODO: make this function in it's own file?
 * Show the asked texture
 * @param {String} res texture resolution
 * @param {import('../../helpers/firestorm/texture').Texture} texture
 */
async function getTexture(message, res, texture) {
	var imgURL = undefined;

	const uses = await texture.uses()
	const path = (await uses[0].paths())[0].path
	const pathVersion = (await uses[0].paths())[0].versions[0]
	const pathUseType = uses[0].editions[0]

	let pathsText = []
	for (let x = 0; uses[x]; x++) {
		let paths = await uses[x].paths()
		pathsText.push(`**__${uses[x].editions.join(', ')}__**`)
		for (let i = 0; paths[i]; i++) {
			if (paths[i].versions.length > 1) pathsText.push(`\`[${paths[i].versions[paths[i].versions.length - 1]} — ${paths[i].versions[0]}]\` ${paths[i].path}`)
			else pathsText.push(`\`[${paths[i].versions[0]}]\` ${paths[i].path}`)
		}
	}

	if (pathUseType == "java") {
		switch (res) {
			case "16":
				imgURL = settings.DEFAULT_MC_JAVA_REPOSITORY + pathVersion + '/' + path
				break
			case "32":
				imgURL = settings.COMPLIANCE_32X_JAVA_REPOSITORY_JAPPA + pathVersion + '/' + path
				break
			case "64":
				imgURL = settings.COMPLIANCE_64X_JAVA_REPOSITORY_JAPPA + pathVersion + '/' + path
				break
		}
	}
	else {
		switch (res) {
			case "16":
				imgURL = settings.DEFAULT_MC_BEDROCK_REPOSITORY + pathVersion + '/' + path
				break
			case "32":
				imgURL = settings.COMPLIANCE_32X_BEDROCK_REPOSITORY_JAPPA + pathVersion + '/' + path
				break
			case "64":
				imgURL = settings.COMPLIANCE_64X_BEDROCK_REPOSITORY_JAPPA + pathVersion + '/' + path
		}
	}

	axios.get(imgURL).then(() => {
		getMeta(imgURL).then(async dimension => {
			const size = dimension.width + '×' + dimension.height;

			var embed = new Discord.MessageEmbed()
				//.setAuthor('Note: this command isn\'t updated for 1.17 Pre-Release 3 yet')
				.setTitle(`[#${texture.id}] ${texture.name}`)
				.setColor(colors.BLUE)
				//.setURL(imgURL) TODO: add a link to the website gallery where more information could be found about the texture
				.setImage(imgURL)
				.addField('Resolution:', size,true)

			if (res === '16') embed.setFooter('Vanilla Texture', settings.VANILLA_IMG);
			if (res === '32') embed.setFooter('Compliance 32x', settings.C32_IMG)
			if (res === '64') embed.setFooter('Compliance 64x', settings.C64_IMG)
			
			/*
			TODO: Get missing contributors from #results and add them to the contribution collection first
			*/

			if (res !== '16') {
				const lastContribution = await texture.lastContribution((res == '32' || res == '64') ? `c${res}` : undefined).catch(() => Promise.resolve(undefined))

				if(lastContribution) {
					const contributors = lastContribution.contributors.map(contributor => { return `<@!${contributor}>` }).join(', ')
					embed.addField('Author(s)', contributors, true)

					try {
						const date = timestampConverter(lastContribution.date)
						embed.addField('Modified', date, true)
					// eslint-disable-next-line no-empty
					} catch (_error) {}
				}
			}
			embed.addField('Paths', pathsText.join('\n'), false)

			const embedMessage = await message.reply({embeds: [embed]});
			addDeleteReact(embedMessage, message, true)

			const imageSmallEnough = dimension.width <= 512 && dimension.height <= 512
			if (imageSmallEnough)
				await embedMessage.react(emojis.MAGNIFY);
			await embedMessage.react(emojis.NEXT_RES);
			await embedMessage.react(emojis.PALETTE);
			if (imageSmallEnough)
				await embedMessage.react(emojis.TILE);

			/**
			 * @param {Discord.MessageReaction} reaction incoming reaction
			 * @param {Discord.User} user Incoming reaction user
			 */
			const filter = (reaction, user) => {
				return !user.bot && [emojis.MAGNIFY, emojis.NEXT_RES, emojis.PALETTE, emojis.TILE].includes(reaction.emoji.id) && user.id === message.author.id;
			};

			embedMessage.awaitReactions({filter, max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first()
				if (reaction.emoji.id === emojis.PALETTE && imageSmallEnough) {
					return palette(embedMessage, embedMessage.embeds[0].image.url, undefined, message)
				}
				if (reaction.emoji.id === emojis.MAGNIFY) {
					return magnify(embedMessage, embedMessage.embeds[0].image.url, undefined, message)
				}
				if (reaction.emoji.id === emojis.NEXT_RES && used.includes(res)) {
					if (!embedMessage.deleted) await embedMessage.delete()
					return getTexture(message, used[(used.indexOf(res) + 1) % used.length], texture)
				}
				if (reaction.emoji.id === emojis.TILE && imageSmallEnough) {
					return tile(embedMessage, embedMessage.embeds[0].image.url, 'grid', undefined, message)
				}
			})
			.catch(async () => {
				try {
					if (message.channel.type !== 'DM' && (imageSmallEnough))
						await embedMessage.reactions.cache.get(emojis.MAGNIFY).remove()
					if (message.channel.type !== 'DM')
						await embedMessage.reactions.cache.get(emojis.NEXT_RES).remove()
					if (message.channel.type !== 'DM')
						await embedMessage.reactions.cache.get(emojis.PALETTE).remove()
					if (message.channel.type !== 'DM' && (imageSmallEnough))
						await embedMessage.reactions.cache.get(emojis.TILE).remove()
				} catch (err) { /* Message deleted */ }
			})

		})
	}).catch((error) => {
		return warnUser(message, strings.TEXTURE_FAILED_LOADING + '\n' +  error)
	})
}