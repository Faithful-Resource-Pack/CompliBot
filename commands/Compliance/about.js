const prefix = process.env.PREFIX
const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')
const firestorm = require('../../helpers/firestorm/index')
const asyncTools = require('../../helpers/asyncTools')
const { MessageEmbed } = require('discord.js')
const { addDeleteReact } = require('../../helpers/addDeleteReact')
const { warnUser } = require('../../helpers/warnUser')
const { contributions, texture } = require('../../helpers/firestorm/all')

const NAME_REGEX = /(.+)#([0-9]{4})/
const CHOICE_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯']
const PACKS_EMOJIS = {} // { c32: ':C32~1:', c64: ':C64:'}

const MAX_EDITIONS = CHOICE_EMOJIS.length + Object.keys(PACKS_EMOJIS).length

module.exports = {
	name: 'about',
	description: strings.command.description.about,
	category: 'Compliance',
	guildOnly: true,
	uses: strings.command.use.anyone,
	syntax: `${prefix}about\n${prefix}about me\n${prefix}about <userTag>\n`,
	example: `${prefix}about Hozz#0889`,
	/**
	 * @param {import('discord.js').Client} client
	 * @param {import('discord.js').Message} message
	 * @param {Array<string>} args
	 * @author TheRolf
	 */
	async execute(client, message, args) {
		if (args.length === 0) args = ['me'] // no args come back to message author

		// parse user id

		const who = args[0]
		let name_match
		if (who !== 'me' && !(name_match = who.match(NAME_REGEX))) return warnUser(message, strings.command.args.invalid.generic)

		let target // undefined
		let target_id // undefined
		if (who === 'me') target = message.member
		else {
			target = [...client.users.cache.values()].filter(u => u.discriminator == name_match[2] && u.username == name_match[1])[0]
		}
		if (target === undefined) return warnUser(message, strings.command.user.do_not_exist)
		target_id = target.id

		// add waiting emoji
		await asyncTools.react('⌛')

		// search texture

		const search_results = await contributions.search([{
			field: 'contributors',
			criteria: 'array-contains',
			value: target_id
		}]).finally(async () => {
			await asyncTools.react('⌛')
		}).catch(err => { throw err })

		if (!Array.isArray(search_results)) return warnUser(message, 'search_results is not an array')

		// no contributions result

		if (search_results.length === 0) {
			if (who === 'me') return warnUser(message, 'You don\'t have any contributions!')
			return warnUser(message, 'The specified user doesn\'t have any contributions!')
		}

		// sort contributions by res

		let big_total = 0
		const contri_sorted_by_res = search_results.reduce((acc, curr) => {
			if (!(curr.res in acc)) acc[curr.res] = []
			acc[curr.res].push(curr)
			++big_total
			return acc
		}, {})

		// get textures names per res

		// 1. get all texture ids
		let texture_ids = search_results.map(contri => contri.textureID)
		texture_ids = texture_ids.filter((el, index) => index === texture_ids.indexOf(el)) // delete doublons

		// 2. get the textures corresponding
		// 3. reduce them to a list of ids
		let texture_results = await (await texture.searchKeys(texture_ids)).reduce((acc, curr) => {
			acc[curr[firestorm.ID_FIELD]] = `[#${curr[firestorm.ID_FIELD]}] ${curr.name}`
			return acc
		}, {})

		// 3. reduce to names
		let contri_embeds = Object.keys(contri_sorted_by_res).reduce((acc, res) => {
			acc[res] = new MessageEmbed()
				.addField(`${res} contributions - First 10 displayed`, contri_sorted_by_res[res].slice(0, 10).map(contri => texture_results[contri.textureID]).join('\n'))
				.addField(`Want to see more contributions?`, `Check the webapp for more!`)
			return acc
		}, {})

		// create description for embed
		let desc = Object.keys(contri_sorted_by_res).slice(0, MAX_EDITIONS).map((res, index) => `${res in PACKS_EMOJIS ? PACKS_EMOJIS[res] : CHOICE_EMOJIS[index]} To see the ${res} texture list`).join('\n')

		// final embed
		const finalEmbed = new MessageEmbed()
			.setTitle(`Found in total ${big_total} contributions`)
			.setAuthor(message.author.tag, message.author.avatarURL())
			.setColor(settings.colors.blue)
			.setFooter(client.user.username, client.user.displayAvatarURL())
			.setDescription(desc)

		Object.keys(contri_sorted_by_res).forEach(res => {
			finalEmbed.addField(res, `${contri_sorted_by_res[res].length} contribution(s)`, false)
		})

		// send message
		const embedMessage = await message.reply({ embed: finalEmbed, embeds: [finalEmbed] })
		await addDeleteReact(embedMessage, message, true)

		loop(embedMessage, message, finalEmbed, contri_embeds)
	}
}

/**
 * @param {import('discord.js').Message} embedMessage // embed message to work with
 * @param {import('discord.js').Message} message // original message received
 * @param {import('discord.js').MessageEmbed} embed // embed published in embedMessage
 * @param {Map<String, import('discord.js').MessageEmbed>} contri_embeds Object with res as keys of the embeds created for the occasion
 */
async function loop(embedMessage, message, embed, contri_embeds) {
	let emojisToAdd = Object.keys(contri_embeds).map((res, index) => res in PACKS_EMOJIS ? PACKS_EMOJIS[res] : CHOICE_EMOJIS[index])

	await Promise.all(emojisToAdd.map(async (emo) => embedMessage.react(emo)))

	const filter = (reaction, user) => {
		return emojisToAdd.includes(reaction.emoji.name) && user.id === message.author.id
	}

	embedMessage.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
		.then(async collected => {
			// if sometihng was collected then we are sure the message exists
			const reaction = collected.first()

			embed.fields =
				reaction.emoji.name in Object.values(PACKS_EMOJIS) ?
					contri_embeds[Object.keys(PACKS_EMOJIS)[Object.values(PACKS_EMOJIS).indexOf(reaction.emoji.name)]] :
					(contri_embeds[Object.keys(contri_embeds)[CHOICE_EMOJIS.indexOf(reaction.emoji.name)]].fields || [])

			if (reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣') {
				// we cannot assume both reactions are here
				const c32_emoji = embedMessage.reactions.cache.get('1️⃣')
				if (c32_emoji) await c32_emoji.remove()

				const c64_emoji = embedMessage.reactions.cache.get('2️⃣')
				if (c64_emoji) await c64_emoji.remove()

				embedMessage = await embedMessage.edit({ embeds: [embed] })
				await loop(embedMessage, message, embed, contri_embeds)
			}
		}).catch(async () => {
			// in this case, the message might have been deleted
			try {
				// we need to make sure we get the message
				embedMessage = await embedMessage.fetch()

				// if the code reaches this part, it means the message is not deleted

				// we cannot assume both reactions are here
				const c32_emoji = embedMessage.reactions.cache.get('1️⃣')
				if (c32_emoji) await c32_emoji.remove()

				const c64_emoji = embedMessage.reactions.cache.get('2️⃣')
				if (c64_emoji) await c64_emoji.remove()
			} catch (_error) {
				// Unknown error message, it was deleted
			}
		})
}
