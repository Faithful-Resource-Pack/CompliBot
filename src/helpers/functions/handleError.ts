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
 * @author TheRolf, Evorp
 * @param client discord client
 * @param error error description
 * @param type error title
 */
export async function handleError(client: Client, error: any, type: string) {
	if (client.tokens.dev) return console.error(`${err}${error?.stack ?? error}`);

	const description = error.stack || JSON.stringify(error);
	// if there's no stack, interpret the error as json
	const codeBlocks = error.stack ? "" : "json";

	if (error instanceof DiscordAPIError)
		// discord's problem (usually), not ours
		return console.error(error, type, description);

	// silence EPROTO errors
	if (error.code == "EPROTO") return console.error(error, type, description);

	if (lastReasons.length == loopLimit) lastReasons.shift(); // remove first logged reason
	lastReasons.push(error);

	// DO NOT DELETE THIS CATCH, IT AVOIDS INFINITE LOOP IF THIS PROMISE REJECTS
	devLogger(client, description, {
		title: type,
		file: constructLogFile(client, error),
		codeBlocks,
	}).catch(console.error);
}
