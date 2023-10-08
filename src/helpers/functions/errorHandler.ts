import { DiscordAPIError, AttachmentBuilder } from "discord.js";
import { Client } from "@client";
import { readFileSync } from "fs";
import { devLogger, err } from "@helpers/logger";
import { Log } from "client/client";
import { join } from "path";
import * as Random from "@utility/random";
import { error as randomSentences } from "@json/quotes.json";

const lastReasons = [];
const loopLimit = 3; // how many times the same error needs to be made to trigger a loop

/**
 * Get all recent logs as a discord attachment
 * @author Juknum
 * @param client discord client
 * @param reason reason for requesting logs
 * @returns whole log as a text file
 */
export const logConstructor = (
	client: Client,
	reason: any = { stack: "You requested it with /logs ¯\\_(ツ)_/¯" },
): AttachmentBuilder => {
	const logTemplate = readFileSync(join(__dirname + "/errorHandler.log"), {
		encoding: "utf-8",
	});
	const template = logTemplate.match(new RegExp(/\%templateStart%([\s\S]*?)%templateEnd/))[1]; // get message template

	const sentence = Random.choice(randomSentences);
	let logText = logTemplate
		.replace("%date%", new Date().toUTCString())
		.replace("%stack%", reason.stack || JSON.stringify(reason))
		.replace("%randomSentence%", sentence)
		.replace("%randomSentenceUnderline%", "-".repeat(sentence.length));

	logText = logText.split("%templateStart%")[0]; // remove message template

	const len = client.getAction().length;
	client
		.getAction()
		.reverse()
		.forEach((log: Log, index) => {
			logText += template
				.replace("%templateIndex%", `${len - index}`)
				.replace(
					"%templateType%",
					log.type === "slashCommand"
						? `${log.type} [${log.data.commandName}]`
						: log.type === "guildMemberUpdate"
						? `${log.type} | ${log.data.user.username} ${
								log.data.reason === "added" ? "joined" : "left"
						  } ${log.data.guild.name}`
						: log.type === "message"
						? `${log.type} | ${
								log.data.author ? (log.data.author.bot ? "BOT" : "USER") : "Unknown (likely bot)"
						  } | ${log.data.author ? log.data.author.username : "Unknown"}`
						: log.type,
				)
				.replace(
					"%templateCreatedTimestamp%",
					`${log.data.createdTimestamp} | ${new Date(log.data.createdTimestamp).toLocaleDateString(
						"en-UK",
						{
							timeZone: "UTC",
						},
					)} ${new Date(log.data.createdTimestamp).toLocaleTimeString("en-US", {
						timeZone: "UTC",
					})} (UTC)`,
				)
				.replace(
					"%templateURL%",
					log.data.url
						? log.data.url
						: log.data.message
						? log.data.message.url // interaction
						: log.data.guildId && log.data.channelId
						? `https://discord.com/channels/${log.data.guildId}/${log.data.channelId}/${
								log.data.messageId ? log.data.messageId : ""
						  }` // slash command constructed url
						: log.data.guild
						? `Guild ID is ${log.data.guild.id}`
						: "Unknown",
				)

				.replace("%templateChannelType%", log.data.channel ? log.data.channel.type : "Not relevant")
				.replace(
					"%templateContent%",
					log.data.content !== undefined
						? log.data.content === ""
							? "Empty"
							: log.data.content
						: log.data.customId
						? log.data.customId // button
						: log.data.options
						? `Parameters: ${JSON.stringify(log.data.options._hoistedOptions)}` // slash commands interaction
						: log.type === "guildMemberUpdate"
						? "Not relevant"
						: "Unknown",
				)
				.replace(
					"%templateEmbeds%",
					log.data.embeds?.length > 0 ? `${JSON.stringify(log.data.embeds)}` : "None",
				)
				.replace(
					"%templateComponents%",
					log.data.components?.length > 0 ? `${JSON.stringify(log.data.components)}` : "None",
				);
		});

	const buffer = Buffer.from(logText, "utf8");
	return new AttachmentBuilder(buffer, { name: "stack.log" });
};

/**
 * Logs errors to a given error channel
 * @author Juknum
 * @param client discord client
 * @param error error description
 * @param type error title
 */
export async function errorHandler(client: Client, error: any, type: string) {
	if (client.tokens.dev) return console.trace(`${err}${error?.stack ?? error}`);

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
		file: logConstructor(client, error),
		codeBlocks,
	}).catch(console.error);
}
