function countReact(message, emoji) {
	try {
		var reaction = message.reactions.cache.get(emoji)
		if (message.reactions.cache.get(emoji) != undefined) return reaction.count - 1; 
		else return 0
	}
	catch(e) {
		return
	}
}

exports.countReact = countReact;