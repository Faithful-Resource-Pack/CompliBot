const settings = require('../../../resources/settings.json')

const { getMessages } = require('../../../helpers/getMessages')
const { changeStatus } = require('./changeStatus')

/**
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelFromID text-channel from where submission are retrieved
 * @param {String} channelOutID text-channel where submission are sent
 * @param {Boolean} toCouncil if textures from channelFromID should be sent with council-like formatting or result-like formatting
 * @param {Integer} delay delay in day from today
 */
async function retrieveSubmission(client, channelFromID, channelOutID, toCouncil, delay) {
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
	messages = messages.map((message) => {
        message = {
            upvote: message.reactions.cache.get(settings.emojis.upvote).count,
            downvote: message.reactions.cache.get(settings.emojis.downvote).count,
            embed: message.embeds[0],
            message: message,
        };

        return message;
    });

	// split messages by their votes (upvote >= downvote)
	const messagesUpvoted = messages.filter(message => message.upvote >= message.downvote)
	const messagesDownvoted = messages.filter(message => message.upvote < message.downvote)

	// split messages
	if (toCouncil) await sendToCouncil(client, messagesUpvoted, messagesDownvoted, channelOutID);
	else await sendToResults(client, messagesUpvoted, messagesDownvoted, channelOutID);
}

/**
 * Send to a channel using council-like formatting
 * This includes council colored embeds, voting emojis, and status messages
 * @author Evorp
 * @param {DiscordClient} client
 * @param {DiscordMessage[]} messagesUpvoted
 * @param {DiscordMessage[]} messagesDownvoted
 * @param {Number} channelOutID
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

		changeStatus(message.message, `<:upvote:${settings.emojis.upvote}> Sent to Council!`, settings.colors.green)
	});

	messagesDownvoted.forEach(message => {
		changeStatus(message.message, `<:downvote:${settings.emojis.downvote}> Not enough upvotes!`, settings.colors.red)
	})
}

/**
 * Send to a channel using result-like formatting
 * This includes dynamic colored embeds, no voting emojis, and status messages
 * @author Evorp
 * @param {DiscordClient} client
 * @param {DiscordMessage[]} messagesUpvoted
 * @param {DiscordMessage[]} messagesDownvoted
 * @param {Number} channelOutID
 */
async function sendToResults(client, messagesUpvoted, messagesDownvoted, channelOutID) {
	const channelOut = client.channels.cache.get(channelOutID);
	const EMOJIS = [settings.emojis.see_more];

    messagesUpvoted.forEach((message) => {
        let embed = message.embed;
        embed.setColor(settings.colors.green);
        embed.fields[1].value = `<:upvote:${settings.emojis.upvote}> Will be added in a future version!`;

        channelOut.send({ embeds: [embed] }).then(async (sentMessage) => {
            for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID));
        });

        changeStatus(message.message, `<:upvote:${settings.emojis.upvote}> Sent to results!`);
    });

	messagesDownvoted.forEach((message) => {
        let embed = message.embed;
        embed.setColor(settings.colors.red);
        embed.fields[1].value = `<:downvote:${settings.emojis.downvote}> This texture did not pass council voting and therefore will not be added. Ask an Art Director Council member for more information.`;

        channelOut.send({ embeds: [embed] }).then(async (sentMessage) => {
            for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID));
        });

        changeStatus(message.message, `<:upvote:${settings.emojis.upvote}> Sent to results!`);
    });
}

exports.retrieveSubmission = retrieveSubmission