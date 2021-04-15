/**
 * Tell if a message attachment is an image
 * @param {DiscordAttachment} msgAttach 
 * @returns true if it's an image
 */
function attachIsImage(msgAttach) {
	var url = msgAttach.url
	return url.indexOf('png', url.length - 'png'.length /*or 3*/) !== -1
}

exports.attachIsImage = attachIsImage