const settings = require('../../../resources/settings.json')

const { getMessages } = require('../../../helpers/getMessages')

/**
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelFromID text-channel from where submission are retrieved
 * @param {String} channelOutID text-channel where submission are sent
 * @param {String} channelInstapassID text-channel where instapassed textures are sent
 * @param {Integer} delay delay in day from today
 */
async function retrieveSubmission(client, channelFromID, channelOutID, channelInstapassID, delay) {
	let messages = await getMessages(client, channelFromID)
	let channelOut = client.channels.cache.get(channelOutID)
	let channelInstapass = client.channels.cache.get(channelInstapassID)

	let delayedDate = new Date();
	delayedDate.setDate(delayedDate.getDate() - delay);

	let instapassedDate = new Date(); // no delay

	let messagesInstapassed = messages.filter(message => {
		let messageDate = new Date(message.createdTimestamp);
		return messageDate.getDate() == instapassedDate.getDate() && messageDate.getMonth() == instapassedDate.getMonth();
	}) // only get instapassed textures
		.filter(message => message.embeds.length > 0)
		.filter(message => message.embeds[0].fields[1] !== undefined && (message.embeds[0].fields[1].value.includes(settings.emojis.instapass)))


	// filter message in the right timezone
	messages = messages.filter(message => {
		let messageDate = new Date(message.createdTimestamp)
		return messageDate.getDate() == delayedDate.getDate() && messageDate.getMonth() == delayedDate.getMonth();
	}) // only get pending submissions
		.filter(message => message.embeds.length > 0)
		.filter(message => message.embeds[0].fields[1] !== undefined && (message.embeds[0].fields[1].value.includes('⏳') || message.embeds[0].fields[1].value.includes(settings.emojis.pending)))

	// map messages adding reacts count, embed and message (easier management like that)
	messages = messages.map(message => {
		let upvotes;
		let downvotes;

		if (message.reactions.cache.get(settings.emojis.upvote_old)) {
			upvotes = message.reactions.cache.get(settings.emojis.upvote_old).count
			downvotes = message.reactions.cache.get(settings.emojis.downvote_old).count
		}
		else {
			upvotes = message.reactions.cache.get(settings.emojis.upvote).count
			downvotes = message.reactions.cache.get(settings.emojis.downvote).count
		}

		message = {
			upvote: upvotes,
			downvote: downvotes,
			embed: message.embeds[0],
			message: message
		}

		return message;
	})

	// split messages following their up/down votes (upvote >= downvote)
	let messagesUpvoted = messages.filter(message => message.upvote >= message.downvote)
	let messagesDownvoted = messages.filter(message => message.upvote < message.downvote)

	// change status message
	messagesDownvoted.forEach(message => {
		editEmbed(message.message, `<:downvote:${settings.emojis.downvote}> Not enough upvotes!`)
	})

	messagesInstapassed.forEach(message => {
		let embed = message.embeds[0];
		embed.setColor(settings.colors.green);
		embed.fields[1].value = `<:instapass:${settings.emojis.instapass}> Instapassed`;

		channelInstapass.send({ embeds: [embed] })
			.then(async sentMessage => {
				for (const emojiID of [settings.emojis.see_more]) await sentMessage.react(client.emojis.cache.get(emojiID))
			})
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