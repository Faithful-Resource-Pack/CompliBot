const settings = require('../../../resources/settings.json')

const { getMessages } = require('../../../helpers/getMessages')

/**
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelFromID text-channel from where submission are retrieved
 * @param {String} channelOutID text-channel where submission are sent
 * @param {Integer} delay delay in day from today
 */
async function retrieveSubmission(client, channelFromID, channelOutID, delay) {
	let messages = await getMessages(client, channelFromID)
	let channelOut = client.channels.cache.get(channelOutID)

	let delayedDate = new Date()
	delayedDate.setDate(delayedDate.getDate() - delay)

	// filter message in the right timezone
	messages = messages.filter(message => {
		let messageDate = new Date(message.createdTimestamp)
		return messageDate.getDate() == delayedDate.getDate() && messageDate.getMonth() == delayedDate.getMonth()
	})

	// filter message that only have embeds & that have a pending status
	messages = messages
		.filter(message => message.embeds.length > 0)
		.filter(message => message.embeds[0].fields[1] !== undefined && message.embeds[0].fields[1].value.includes('⏳'))

	// map messages adding reacts count, embed and message (easier management like that)
	messages = messages.map(message => {

		/* uncomment below code on the 11/12/2021 after the submission functions executed (use "[#1425] cod" texture for orientation)
		let upvotes = message.reactions.cache.get(settings.emojis.upvote).count
		let downvotes = message.reactions.cache.get(settings.emojis.downvote).count
		uncomment above code with conditions above

		remove below code with conditions above */
		let upvotes = message.reactions.cache.get(settings.emojis.upvote_old).count
		let downvotes = message.reactions.cache.get(settings.emojis.downvote_old).count
		// remove above code with conditions above

		message = {
			upvote: upvotes,
			downvote: downvotes,
			embed: message.embeds[0],
			message: message
		}

		return message
	})

	// split messages following their up/down votes (upvote >= downvote)
	let messagesUpvoted = messages.filter(message => message.upvote >= message.downvote)
	let messagesDownvoted = messages.filter(message => message.upvote < message.downvote)

	// change status message
	messagesDownvoted.forEach(message => {
		editEmbed(message.message, `<:downvote:${settings.emojis.downvote}> Not enough upvotes!`)
	})

	// send message to the output channel & change status
	const EMOJIS = [settings.emojis.upvote, settings.emojis.downvote, settings.emojis.see_more]
	messagesUpvoted.forEach(message => {
		channelOut.send({
			embeds: [
				message.embed
					.setColor(settings.colors.council)
					.setDescription(`[Original Post](${message.message.url})\n${message.embed.description ? message.embed.description : ''}`)
			]
		})
			.then(async sentMessage => {
				for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID))
			})

		editEmbed(message.message, `<:upvote:${settings.emojis.upvote}> Sent to Council!`)
	})
}

async function editEmbed(message, string) {
	let embed = message.embeds[0]
	embed.fields[1].value = string

	// fix the weird bug that also apply changes to the old embed (wtf)
	embed.setColor(settings.colors.blue)
	if (embed.description !== null) embed.setDescription(message.embeds[0].description.replace(`[Original Post](${message.url})\n`, ''))

	await message.edit({ embeds: [embed] })
}

exports.retrieveSubmission = retrieveSubmission