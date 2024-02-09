import { DiscordAPIError, AttachmentBuilder } from "discord.js";
import { Client } from "@client";
import { readFileSync } from "fs";
import { devLogger, err } from "@helpers/logger";
import { Log } from "client/client";
import { join } from "path";
import { choice } from "@utility/methods";
import { error as randomSentences } from "@json/quotes.json";
import { formatLogContent, formatLogType, formatLogURL } from "@functions/formatLog";

const lastReasons = [];
const loopLimit = 3; // how many times the same error needs to be made to trigger a loop

/**
 * Get all recent logs as a discord attachment
 * @author Juknum
 * @param client discord client
 * @param reason reason for requesting logs
 * @returns whole log as a text file
 */
export const constructLogFile = (
	client: Client,
	reason: any = { stack: "You requested it with /logs ¯\\_(ツ)_/¯" },
): AttachmentBuilder => {
	const logTemplate = readFileSync(join(__dirname, "logTemplate.log"), {
		encoding: "utf-8",
	});

	const template = logTemplate.match(new RegExp(/\%templateStart%([\s\S]*?)%templateEnd/))[1]; // get message template

	const sentence = choice(randomSentences);
	const logText =
		logTemplate
			.replace("%date%", new Date().toUTCString())
			.replace("%stack%", reason.stack || JSON.stringify(reason))
			.replace("%randomSentence%", sentence)
			.replace("%randomSentenceUnderline%", "-".repeat(sentence.length))
			.split("%templateStart%")[0] +
		client.logs.reverse().reduce(
			(acc, log: Log, index) =>
				acc +
				template
					.replace("%templateIndex%", `${client.logs.length - index}`)
					.replace("%templateType%", formatLogType(log))
					.replace(
						"%templateCreatedTimestamp%",
						`${log.data.createdTimestamp} | ${new Date(
							log.data.createdTimestamp,
						).toLocaleDateString("en-UK", {
							timeZone: "UTC",
						})} ${new Date(log.data.createdTimestamp).toLocaleTimeString("en-US", {
							timeZone: "UTC",
						})} (UTC)`,
					)
					.replace("%templateURL%", formatLogURL(log.data))
					.replace(
						"%templateChannelType%",
						log.data.channel ? log.data.channel.type : "Not relevant",
					)
					.replace("%templateContent%", formatLogContent(log))
					.replace(
						"%templateEmbeds%",
						log.data.embeds?.length > 0 ? `${JSON.stringify(log.data.embeds)}` : "None",
					)
					.replace(
						"%templateComponents%",
						log.data.components?.length > 0 ? `${JSON.stringify(log.data.components)}` : "None",
					),
			"", // start from empty string
		);

	return new AttachmentBuilder(Buffer.from(logText, "utf8"), { name: "stack.log" });
};

/**
 * Handle and log errors
 * @author Juknum
 * @param client discord client
 * @param error error description
 * @param type error title
 */
export async function errorHandler(client: Client, error: any, type: string) {
	if (client.tokens.dev) return console.error(`${err}${error?.stack ?? error}`);

	let eprotoError = false;
	let description = error.stack;
	let codeBlocks = "";

	if (error.isAxiosError) {
		// axios errors are JSON
		description = JSON.stringify(error.toJSON());
		eprotoError = error.code === "EPROTO";
		codeBlocks = "json";
	} else if (!description) {
		// no stack trace so it's JSON
		description = JSON.stringify(error);
		codeBlocks = "json";
	} else if (error instanceof DiscordAPIError)
		// not on our end, just clutters logs
		return console.error(error, type, description);

	// silence EPROTO errors
	if (eprotoError) return console.error(error, type, description);

	if (lastReasons.length == loopLimit) lastReasons.pop(); // pop removes an item from the end of an array
	lastReasons.push(error); // push adds one to the start

	devLogger(client, description, {
		title: type,
		file: constructLogFile(client, error),
		codeBlocks,
	}).catch(console.error);
}
