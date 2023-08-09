/**
 * Convert MessageAttachment objects into sendable URLs
 * @author RobertR11, Evorp
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").MessageAttachment[]} fileArray files to commit
 * @returns {Promise<String[]>} array of image urls from #submission-spam
 */
module.exports = async function getImages(client, ...fileArray) {
	let imgArray = [];
	const imgMessage = await client.channels.cache
		.get("916766396170518608")
		.send({ files: fileArray });

	imgMessage.attachments.forEach((Attachment) => {
		imgArray.push(Attachment.url);
	});

	return imgArray;
};
