/**
 * Count reaction of an emoji from a specified message
 * @author Juknum
 * @param {DiscordMessage} message 
 * @param {String} emoji have to be a valid Discord Emoji
 * @returns Number of reaction from that emoji
 */
function countReact(message, emoji) {
	try {
		var reaction = message.reactions.cache.get(emoji)
		if (message.reactions.cache.get(emoji) != undefined) return reaction.count - 1 // remove bot reactions from count
		else return 0
	}
	catch(err) {
		return
	}
}

exports.countReact = countReact