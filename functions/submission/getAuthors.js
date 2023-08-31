/**
 * Detects co-authors from pings and curly bracket syntax in a given message
 * @author Evorp
 * @param {import("discord.js").Message} message
 * @returns {Promise<String[]>} array of author's discord IDs
 */
module.exports = async function getAuthors(message) {
	let authors = [message.author.id];

	// regex to detect text between curly brackets
	const names = (message.content.match(/(?<=\{)(.*?)(?=\})/g) ?? []).map((name) =>
		name.toLowerCase().trim(),
	);

	if (names.length) {
		// fetch all contributors and check if their username matches the one in curly brackets
		const res = await fetch(`https://api.faithfulpack.net/v2/users/names`);
		const contributionJSON = await res.json();
		for (let user of contributionJSON) {
			// if no username set it will throw an error otherwise
			if (!user.username) continue;

			if (names.includes(user.username.toLowerCase()) && !authors.includes(user.id))
				authors.push(user.id);
		}
	}

	// detect by ping (using regex to ensure users not in the server get included)
	const mentions = message.content.match(/(?<=\<\@)(.*?)(?=\>)/g) ?? [];
	mentions.forEach((mention) => {
		if (!authors.includes(mention)) authors.push(mention);
	});

	return authors;
};
