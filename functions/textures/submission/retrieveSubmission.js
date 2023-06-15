const settings = require('../../../resources/settings.json')
const strings = require('../../../resources/strings.json')

const { getMessages } = require('../../../helpers/getMessages')
const { changeStatus } = require('./changeStatus')

/**
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelFromID text-channel from where submission are retrieved
 * @param {String} channelOutID text-channel where submission are sent
 * @param {Boolean} toCouncil true if from submissions to council, false if from council to results
 * @param {Integer} delay delay in day from today
 * @param {Boolean} councilDisabled whether to disable council or not (off by default)
 */
async function retrieveSubmission(client, channelFromID, channelOutID, toCouncil, delay, councilDisabled=false) {
	let messages = await getMessages(client, channelFromID)

	let delayedDate = new Date();
	delayedDate.setDate(delayedDate.getDate() - delay);

	// filter message in the right timezone
	messages = messages.filter(message => {
		let messageDate = new Date(message.createdTimestamp)
		return messageDate.getDate() == delayedDate.getDate() && messageDate.getMonth() == delayedDate.getMonth();
	}) // only get pending submissions
		.filter(message => message.embeds.length > 0)
		.filter(message => message.embeds[0].fields[1] !== undefined && message.embeds[0].fields[1].value.includes(settings.emojis.pending))

	// map messages adding reacts count, embed and message (easier management like that)
	messages = messages.map(message => {
		const upvotes = message.reactions.cache.get(settings.emojis.upvote)
		const downvotes = message.reactions.cache.get(settings.emojis.downvote)

		message = {
			upvote: upvotes ? upvotes.count : 1,
			downvote: downvotes ? downvotes.count : 1,
			embed: message.embeds[0],
			message: message
		}

		return message;
	})
	// split messages by their votes (upvote >= downvote)
	const messagesUpvoted = messages.filter(message => message.upvote >= message.downvote)
	const messagesDownvoted = messages.filter(message => message.upvote < message.downvote)

	if (toCouncil) await sendToCouncil(client, messagesUpvoted, messagesDownvoted, channelOutID)
	else await sendToResults(client, messagesUpvoted, messagesDownvoted, channelOutID, councilDisabled)
}

/**
 * Send textures to a given council channel
 * @author Evorp
 * @param {DiscordClient} client
 * @param {DiscordMessage[]} messagesUpvoted
 * @param {DiscordMessage[]} messagesDownvoted
 * @param {String} channelOutID
 */
async function sendToCouncil(client, messagesUpvoted, messagesDownvoted, channelOutID) {
	const channelOut = client.channels.cache.get(channelOutID);
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
		changeStatus(message.message, `<:upvote:${settings.emojis.upvote}> Sent to council!`, settings.colors.green);

		// fix weird bug
		if (message.message.embeds[0].description !== null) {
			let embed = message.message.embeds[0];
			embed.setDescription(embed.description.replace(`[Original Post](${message.message.url})\n`, ''))
			message.message.edit({ embeds: [embed] });
		}
	});

	messagesDownvoted.forEach(message => {
		changeStatus(message.message, `<:downvote:${settings.emojis.downvote}> Not enough upvotes!`, settings.colors.red)
	})
}

/**
 * Send textures to a given result channel
 * @author Evorp
 * @param {DiscordClient} client
 * @param {DiscordMessage[]} messagesUpvoted
 * @param {DiscordMessage[]} messagesDownvoted
 * @param {String} channelOutID
 * @param {Boolean} councilDisabled whether to disable council or not (off by default)
 */
async function sendToResults(client, messagesUpvoted, messagesDownvoted, channelOutID, councilDisabled=false) {
	const channelOut = client.channels.cache.get(channelOutID);
	const EMOJIS = [settings.emojis.see_more];

    messagesUpvoted.forEach((message) => {
        let embed = message.embed;
        embed.setColor(settings.colors.green);
		embed.fields[1].value = `<:upvote:${settings.emojis.upvote}> Will be added in a future version!`

        channelOut.send({ embeds: [embed] }).then(async (sentMessage) => {
            for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID));
        });

        changeStatus(message.message, `<:upvote:${settings.emojis.upvote}> Sent to results!`);
    });

	messagesDownvoted.forEach((message) => {
        let embed = message.embed;
        embed.setColor(settings.colors.red);

		if (!councilDisabled) { // don't you love having to pass a value in down like three functions just to format some strings
			embed.fields[1].value = `<:downvote:${settings.emojis.downvote}> This texture did not pass council voting and therefore will not be added. Ask an Art Director Council member for more information.`;
			channelOut.send({ embeds: [embed] }).then(async (sentMessage) => {
				for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID));
			});

			changeStatus(message.message, `<:downvote:${settings.emojis.downvote}> Sent to results!`);
		} else changeStatus(message.message, `<:downvote:${settings.emojis.downvote}> Not enough upvotes!`);
    });
}

exports.retrieveSubmission = retrieveSubmission