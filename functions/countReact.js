function countReact(message, emoji) {
	var reaction = message.reactions.cache.get(emoji);
	if (message.reactions.cache.get(emoji) != undefined) return reaction.count - 1; 
	else return 0
}

exports.countReact = countReact;