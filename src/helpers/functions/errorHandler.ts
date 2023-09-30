import { DiscordAPIError, AttachmentBuilder, EmbedBuilder, TextChannel } from "discord.js";
import { Client } from "@client";
import { readFileSync } from "fs";
import { err } from "@helpers/logger";
import { colors } from "@helpers/colors";
import { Log } from "client/client";
import { join } from "path";
import axios from "axios";
import * as Random from "@helpers/random";
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
 * @param reason error description
 * @param type error title
 */
export const errorHandler: Function = async (client: Client, reason: any, type: string) => {
	console.error(`${err} ${reason?.stack ?? reason ?? "No reason provided!"}`);

	if (reason instanceof DiscordAPIError) return; // not on our end

	// get dev log channel
	const channel = client.channels.cache.get(client.tokens.errorChannel) as TextChannel;
	if (channel === undefined) return; // avoid infinite loop when crash is outside of client

	if (lastReasons.length == loopLimit) lastReasons.pop(); // pop removes an item from the end of an array
	lastReasons.push(reason); // push adds one to the start

	//checks if every reasons are the same
	/*if (lastReasons.every((v) => v.stack == lastReasons[0].stack) && lastReasons.length == loopLimit) {
		if (client.verbose) console.log(`${err}Suspected crash loop detected; Restarting...`);

		const embed = new EmbedBuilder()
			.setTitle("(Probably) Looped, crash encountered!")
			.setFooter({ text: `Got the same error ${loopLimit} times in a row. Attempting restart...` })
			.setDescription("```bash\n" + reason.stack + "\n```");
		await channel.send({ embeds: [embed] });

		client.restart();
	}*/

	const error: string = (await axios.get(`${client.tokens.apiUrl}settings/images.error`)).data;

	const embed = new EmbedBuilder()
		.setAuthor({ name: type, iconURL: error }) // much compressed than .title() & .thumbnail()
		.setColor(colors.red)
		.setTimestamp()
		.setDescription(`\`\`\`${reason?.stack ?? reason ?? "No reason provided!"}\`\`\``)
		.setFooter({ text: client.user.username, iconURL: client.user.avatarURL() });

	await channel.send({ embeds: [embed] }).catch(console.error);
	await channel.send({ files: [logConstructor(client, reason)] }).catch(console.error); // send after because the file is displayed before the embed (embeds are prioritized)
};
