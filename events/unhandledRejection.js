const devLogger = require("@helpers/devLogger");

/**
 * @param {import("discord.js").Client} client Discord client treating the information
 * @param {Error | import("axios").AxiosError} error The object with which the promise was rejected
 * @param {Promise} promise The rejected promise
 * @param {import("discord.js").Message?} originMessage Origin user message
 */
module.exports = function unhandledRejection(client, error, promise, originMessage) {
	// if (DEV) return console.trace(error?.stack ?? error);

	let eproto_error = false;
	let description = error.stack; // stack else AxiosError else random error
	let isJSON = false;
	if (error.isAxiosError) {
		description = JSON.stringify(error.toJSON());
		eproto_error = error.code === "EPROTO";
		isJSON = true;
	} else if (!description) {
		description = JSON.stringify(error);
		isJSON = true;
	}

	if (eproto_error) return console.error(error, promise, description);

	if (originMessage?.url !== undefined)
		description = `Coming from [this message](${originMessage.url})\n` + description;

	console.error(error, promise);

	// DO NOT DELETE THIS CATCH, IT AVOIDS INFINITE LOOP IF THIS PROMISE REJECTS
	devLogger(client, description).catch(console.error);
};
