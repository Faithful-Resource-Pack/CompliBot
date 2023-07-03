/**
 * Convert MessageAttachment objects into sendable URLs
 * @author RobertR11, Evorp
 * @param {DiscordClient} client
 * @param {...MessageAttachment} fileArray files to commit
 * @returns array of image urls from #submission-spam
 */
module.exports = async function getImages(client, ...fileArray) {
	let imgArray = new Array();
	const imgMessage = await client.channels.cache
		.get("916766396170518608")
		.send({ files: fileArray });

	imgMessage.attachments.forEach((Attachment) => {
		imgArray.push(Attachment.url);
	});

	return imgArray;
};
