/*eslint-env node*/
const prefix = process.env.PREFIX

const Discord = require('discord.js')
const axios = require('axios').default
const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')
const choiceEmbed = require('../../helpers/choiceEmbed')

const { magnify } = require('../../functions/textures/magnify')
const { palette } = require('../../functions/textures/palette')
const { tile } = require('../../functions/textures/tile');
const { getMeta } = require('../../helpers/getMeta')
const { warnUser } = require('../../helpers/warnUser')
const { timestampConverter } = require('../../helpers/timestampConverter')
const { addDeleteReact } = require('../../helpers/addDeleteReact')

const allowed = ['vanilla', '16', '32', '64'];
const used = ['16', '32', '64'];

const MinecraftSorter = (a, b) => {
	const aSplit = a.split('.').map(s => parseInt(s))
	const bSplit = b.split('.').map(s => parseInt(s))

	const upper = Math.min(aSplit.length, bSplit.length)
	let i = 0
	let result = 0
	while (i < upper && result == 0) {
		result = (aSplit[i] == bSplit[i]) ? 0 : (aSplit[i] < bSplit[i] ? -1 : 1) // each number
		++i
	}

	if (result != 0) return result

	result = (aSplit.length == bSplit.length) ? 0 : (aSplit.length < bSplit.length ? -1 : 1) // longer length wins

	return result
}

module.exports = {
	name: 'texture',
	aliases: ['textures'],
	description: strings.command.description.texture,
	category: 'Minecraft',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}texture <16/32/64> <texture_name>\n${prefix}texture <16/32/64> <_name>\n${prefix}texture <16/32/64> </folder/>`,
	example: `${prefix}texture 16 dirt`,

	/**
	 * @param {Discord.Client} client The Discord bot client
	 * @param {Discord.Message} message The incoming message to respond to
	 * @param {Array<string>} args All words following the command
	 */
	async execute(client, message, args) {

		let results = []
		const textures = require('../../helpers/firestorm/texture')
		const paths = require('../../helpers/firestorm/texture_paths')

		// no args given
		if (args == '') return warnUser(message, strings.command.args.none_given)

		let res = args[0]
		let search = args[1]

		// no valids args given
		if (!allowed.includes(args[0])) return warnUser(message, strings.command.args.invalid.generic)
		// no search field given
		if (!args[1]) return warnUser(message, strings.command.args.not_enough_given)
		else args[1] = String(args[1])

		// texture name too short
		if (args[1].length < 3) return warnUser(message, strings.command.texture.too_short)

		// universal args
		if (args[0].includes('16') || args[0] === 'vanilla') res = '16'
		if (args[0].includes('32')) res = '32'
		if (args[0].includes('64')) res = '64'

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
						let versions = paths[k].versions.sort(MinecraftSorter)
						if (versions.length > 1) stringBuilder.push(`\`[${versions[0]}+]\`\t${paths[k].path.replace(search, `**${search}**`).replace(/_/g, '\\_')}`)
						else stringBuilder.push(`\`[${versions[0]}]\`\t${paths[k].path.replace(search, `**${search}**`).replace(/_/g, '\\_')}`)
					}
				}

				choice.push(
					`\`[#${results[i].id}]\` ${results[i].name.replace(search, `**${search}**`).replace(/_/g, '\\_')}
					> ${stringBuilder.join('\n> ')}\n`
				)
			}

			choiceEmbed(message, {
				title: `${results.length} results, react to choose one!`,
				description: strings.command.texture.search_description,
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
		else if (results.length == 1) await getTexture(message, res, results[0])
		else await warnUser(message, strings.command.texture.does_not_exist)
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
	const pathSort = (await uses[0].paths())[0].versions.sort(MinecraftSorter).reverse()
	const pathVersion = pathSort[0]
	const pathUseType = uses[0].editions[0]

	let pathsText = []
	for (let x = 0; uses[x]; x++) {
		let paths = await uses[x].paths()
		pathsText.push(`**__${uses[x].editions.join(', ')}__**`)
		for (let i = 0; paths[i]; i++) {
			let versions = paths[i].versions.sort(MinecraftSorter)
			if (versions.length > 1) pathsText.push(`\`[${versions[0]} — ${versions[versions.length - 1]}]\` ${paths[i].path.replace('assets/minecraft/', '').replace('textures/', '')}`)
			else pathsText.push(`\`[${versions[0]}]\` ${paths[i].path.replace('assets/minecraft/', '').replace('textures/', '')}`)
		}
	}

	if (pathUseType == "java") {
		switch (res) {
			case "16":
				imgURL = settings.repositories.raw.default.java + pathVersion + '/' + path
				break
			case "32":
				imgURL = settings.repositories.raw.c32.java + 'Jappa-' + pathVersion + '/' + path
				break
			case "64":
				imgURL = settings.repositories.raw.c64.java + 'Jappa-' + pathVersion + '/' + path
				break
		}
	}
	else {
		switch (res) {
			case "16":
				imgURL = settings.repositories.raw.default.bedrock + pathVersion + '/' + path
				break
			case "32":
				imgURL = settings.repositories.raw.c32.bedrock + 'Jappa-' + pathVersion + '/' + path
				break
			case "64":
				imgURL = settings.repositories.raw.c64.bedrock + 'Jappa-' + pathVersion + '/' + path
		}
	}

	axios.get(imgURL).then(() => {
		getMeta(imgURL).then(async dimension => {
			const size = dimension.width + '×' + dimension.height;

			var embed = new Discord.MessageEmbed()
				.setTitle(`[#${texture.id}] ${texture.name}`)
				.setColor(settings.colors.blue)
				//.setURL(imgURL) TODO: add a link to the website gallery where more information could be found about the texture
				.setImage(imgURL)
				.addField('Resolution:', size, true)

			if (res === '16') embed.setFooter('Vanilla Texture', settings.VANILLA_IMG);
			if (res === '32') embed.setFooter('Compliance 32x', settings.images.c32)
			if (res === '64') embed.setFooter('Compliance 64x', settings.images.c64)

			/*
			TODO: Get missing contributors from #results and add them to the contribution collection first
			*/

			if (res !== '16') {
				const lastContribution = await texture.lastContribution((res == '32' || res == '64') ? `c${res}` : undefined).catch(() => Promise.resolve(undefined))

				if (lastContribution) {
					const contributors = lastContribution.contributors.map(contributor => { return `<@!${contributor}>` }).join(', ')
					embed.addField('Author(s)', contributors, true)

					try {
						const date = timestampConverter(lastContribution.date)
						embed.addField('Modified', date, true)
						// eslint-disable-next-line no-empty
					} catch (_error) { }
				}
			}
			embed.addField('Paths', pathsText.join('\n'), false)

			const embedMessage = await message.reply({ embeds: [embed] });
			addDeleteReact(embedMessage, message, true)

			const imageSmallEnough = dimension.width <= 512 && dimension.height <= 512
			if (imageSmallEnough)
				await embedMessage.react(settings.emojis.magnify).catch(() => { }); // avoids "Unknown message" error id reacting to a deleted message
			await embedMessage.react(settings.emojis.next_res).catch(() => { }); // avoids "Unknown message" error id reacting to a deleted message
			await embedMessage.react(settings.emojis.palette).catch(() => { }); // avoids "Unknown message" error id reacting to a deleted message
			if (imageSmallEnough)
				await embedMessage.react(settings.emojis.tile).catch(() => { }); // avoids "Unknown message" error id reacting to a deleted message

			/**
			 * @param {Discord.MessageReaction} reaction incoming reaction
			 * @param {Discord.User} user Incoming reaction user
			 */
			const filter = (reaction, user) => {
				return !user.bot && [settings.emojis.magnify, settings.emojis.next_res, settings.emojis.palette, settings.emojis.tile].includes(reaction.emoji.id) && user.id === message.author.id;
			};

			embedMessage.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
				.then(async collected => {
					const reaction = collected.first()
					if (reaction.emoji.id === settings.emojis.palette && imageSmallEnough) {
						return palette(embedMessage, embedMessage.embeds[0].image.url, undefined, message)
					}
					if (reaction.emoji.id === settings.emojis.magnify) {
						return magnify(embedMessage, embedMessage.embeds[0].image.url, undefined, message)
					}
					if (reaction.emoji.id === settings.emojis.next_res && used.includes(res)) {
						if (!embedMessage.deleted) await embedMessage.delete()
						return getTexture(message, used[(used.indexOf(res) + 1) % used.length], texture)
					}
					if (reaction.emoji.id === settings.emojis.tile && imageSmallEnough) {
						return tile(embedMessage, embedMessage.embeds[0].image.url, 'grid', undefined, message)
					}
				})
				.catch(async () => {
					try {
						if (message.channel.type !== 'DM' && (imageSmallEnough))
							await embedMessage.reactions.cache.get(settings.emojis.magnify).remove()
						if (message.channel.type !== 'DM')
							await embedMessage.reactions.cache.get(settings.emojis.next_res).remove()
						if (message.channel.type !== 'DM')
							await embedMessage.reactions.cache.get(settings.emojis.palette).remove()
						if (message.channel.type !== 'DM' && (imageSmallEnough))
							await embedMessage.reactions.cache.get(settings.emojis.tile).remove()
					} catch (err) { /* Message deleted */ }
				})

		})
	}).catch((error) => {
		return warnUser(message, strings.command.texture.loading_failed + '\n' + error)
	})
}