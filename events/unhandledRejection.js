const { MessageEmbed } = require("discord.js");

// Environment vars
const DEV = process.env.DEV.toLowerCase() == "true";
const LOG_DEV = process.env.LOG_DEV.toLowerCase() == "true";

/**
 * @param {import("discord.js").Client} client Discord client treating the information
 * @param {Error | import("axios").AxiosError} error The object with which the promise was rejected
 * @param {Promise} promise The rejected promise
 * @param {import("discord.js").Message?} originMessage Origin user message
 */
module.exports = function unhandledRejection(client, error, promise, originMessage) {
	if (DEV) return console.trace(error.stack ?? error);
	const settings = require("../resources/settings.json");

	const channel = client.channels.cache.get(LOG_DEV ? "867499014085148682" : "853547435782701076");

	let eproto_error = false;
	let content = error.stack; // stack else AxiosError else random error
	let isJSON = false;
	if (error.isAxiosError) {
		content = JSON.stringify(error.toJSON());
		eproto_error = error.code === "EPROTO";
		isJSON = true;
	} else if (!content) {
		content = JSON.stringify(error);
		isJSON = true;
	}
	const syntax = isJSON ? "json" : "fix";

	if (eproto_error) {
		console.error(error, promise, content);
		return;
	}

	let description = `\`\`\`${syntax}\n${content}\`\`\``;

	if (originMessage !== undefined && originMessage.url !== undefined) {
		description = "Coming from [this message](" + originMessage.url + ")\n" + description;
	}

	const embed = new MessageEmbed()
		.setTitle("Unhandled Rejection")
		.setDescription(description)
		.setColor(settings.colors.red)
		.setTimestamp();

	console.error(error, promise);

	// DO NOT DELETE THIS CATCH, IT AVOIDS INFINITE LOOP IF THIS PROMISE REJECTS
	channel.send({ embeds: [embed] }).catch(console.error);
};
