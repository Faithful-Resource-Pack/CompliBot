const settings = require('../../../resources/settings.json')
const strings = require('../../../resources/strings.json')

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
	messages = messages.map(message => {
		const upvotes = message.reactions.cache.get(settings.emojis.upvote)
		const downvotes = message.reactions.cache.get(settings.emojis.downvote)

		message = {
			upvote: upvotes ? upvotes.count : 0,
			downvote: downvotes ? downvotes.count : 0,
			embed: message.embeds[0],
			message: message
		}

		return message;
	})

	// split messages by their votes (upvote >= downvote)
	const messagesUpvoted = messages.filter(message => message.upvote >= message.downvote)
	const messagesDownvoted = messages.filter(message => message.upvote < message.downvote)

	// split messages

	const submissionChannels = Object.values(settings.submission.packs).map(i => i.channels.submit);
	let councilDisabled = false;
	if (submissionChannels.includes(channelFromID)) councilDisabled = true;

	if (toCouncil) await sendToCouncil(client, messagesUpvoted, messagesDownvoted, channelOutID);
	else await sendToResults(client, messagesUpvoted, messagesDownvoted, channelOutID, councilDisabled);
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

		changeStatus(message.message, `<:upvote:${settings.emojis.upvote}> ${strings.submission.status.community.passed}`, settings.colors.green)
	});

	messagesDownvoted.forEach(message => {
		changeStatus(message.message, `<:downvote:${settings.emojis.downvote}> ${strings.submission.status.community.failed}`, settings.colors.red)
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
async function sendToResults(client, messagesUpvoted, messagesDownvoted, channelOutID, councilDisabled = false) {
	const channelOut = client.channels.cache.get(channelOutID);
	const EMOJIS = [settings.emojis.see_more];
	let councilStrings = strings.submission.status;
	let resultStrings = strings.submission.status;

	if (councilDisabled) {
		councilStrings = councilStrings.no_council
		resultStrings = resultStrings.no_results

	} else {
		councilStrings = councilStrings.council;
		resultStrings = resultStrings.results;
	}

    messagesUpvoted.forEach((message) => {
        let embed = message.embed;
        embed.setColor(settings.colors.green);
        embed.fields[1].value = `<:upvote:${settings.emojis.upvote}> ${resultStrings.passed}`;

        channelOut.send({ embeds: [embed] }).then(async (sentMessage) => {
            for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID));
        });

        changeStatus(message.message, `<:upvote:${settings.emojis.upvote}> ${councilStrings.passed}`);
    });

	messagesDownvoted.forEach((message) => {
        let embed = message.embed;
        embed.setColor(settings.colors.red);
        embed.fields[1].value = `<:downvote:${settings.emojis.downvote}> ${resultStrings.failed}`;

        channelOut.send({ embeds: [embed] }).then(async (sentMessage) => {
            for (const emojiID of EMOJIS) await sentMessage.react(client.emojis.cache.get(emojiID));
        });

        changeStatus(message.message, `<:downvote:${settings.emojis.downvote}> ${resultStrings.failed}`);
    });
}

exports.retrieveSubmission = retrieveSubmission