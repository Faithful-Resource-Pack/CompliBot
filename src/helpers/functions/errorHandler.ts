import { ButtonInteraction, CommandInteraction, Guild, GuildMember, MessageAttachment, MessageEmbed, SelectMenuInteraction, TextChannel } from "discord.js";
import { Client, Message } from "@client";
import fs from "fs";
import { err } from "@helpers/logger";
import { colors } from "@helpers/colors";
import { Log } from "client/client";
import path from "path";

const randomSentences: Array<string> = [
	"Oh no, not again!",
	"Well, it's unexpected...",
	"OOPS, sorry, my bad!",
	"I thought TS > JS was true...",
	"This one is going to be a nightmare to solve!",
	"Please, don't blame me, I try my best. Each day.",
	"Like humans, I have some errors",
	"Don't be sad, have a hug <3",
	"oh.",
	"Another one! DJ Khaleeeeed!",
	"I just don't know what went wrong :(",
	"My bad.",
	"Hold my beer.",
	"I'm so sorry, I'm just a bot :(",
	"Unfortunately I was coded in a way that I can't handle this error",
	"Would you like a cupcake?",
	"Why did you do that?",
	"Don't be sad. I'll do better next time, I promise!",
	"somebody set up us the error",
	"I'm sorry, Dave.",
	"Hi. I'm CompliBot, and I'm a erroraholic.",
	"Ooh. Shiny.",
	"But it works on my machine.",
	"Oops.",
	"On the bright side, I bought you a teddy bear!",
	"Shall we play a game?",
	"Surprise! Haha. Well, this is awkward.",
	"This doesn't make any sense!",
	"Why is it breaking :(",
	"Don't do that.",
	"Ouch. That hurt :(",
];

var lastReasons = [];
const loopLimit = 3; //how many times the same error needs to be made to trigger a loop

export const logConstructor: Function = (client: Client, reason: any = {stack: "You requested it with /logs ¯\\_(ツ)_/¯"}): MessageAttachment => {
	const logTemplate = fs.readFileSync(path.join(__dirname + "/errorHandler.log"), { encoding: "utf-8" });
	const template = logTemplate.match(new RegExp(/\%templateStart%([\s\S]*?)%templateEnd/))[1]; // get message template

	const t = Math.floor(Math.random() * randomSentences.length);
	let logText = logTemplate
		.replace("%date%", new Date().toUTCString())
		.replace("%stack%", reason.stack || JSON.stringify(reason))
		.replace("%randomSentence%", randomSentences[t])
		.replace("%randomSentenceUnderline%", "-".repeat(randomSentences[t].length));

	logText = logText.split("%templateStart%")[0]; // remove message template

	let len: number = client.getAction().length;
	client.getAction().reverse().forEach((log: Log, index) => {
		if (log.type == "message") console.log(log.data);

		logText += template
			.replace("%templateIndex%", `${len - index}`)
			.replace("%templateType%", 
				log.type === "slashCommand" ? `${log.type} (${log.data.commandName})` 
				: log.type === "guildMemberUpdate" ? `${log.type} | ${log.data.user.username} ${log.data.reason === "added" ? "joined" : "left"} ${log.data.guild.name}`
				: log.type === "message" ? `${log.type} [${log.data.isDeleted ? "deleted" : "created"}] | ${log.data.author.bot ? "BOT" : "USER"} | ${log.data.author.username}`
				: log.type
			)
			.replace("%templateCreatedTimestamp%", `${log.data.createdTimestamp} | ${new Date(log.data.createdTimestamp).toLocaleDateString("en-UK", { timeZone: "UTC" })} ${new Date(log.data.createdTimestamp).toLocaleTimeString("en-US", { timeZone: "UTC" })} (UTC)`)
			.replace("%templateURL%", 
				log.data.url ? log.data.url
				: log.data.message ? log.data.message.url // interaction
				: log.data.guildId && log.data.channelId ? `https://discord.com/channels/${log.data.guildId}/${log.data.channelId}/${log.data.messageId ? log.data.messageId :''}` // slash command constructed url
				: log.data.guild ? `Guild ID is ${log.data.guild.id}`
				: "Unknown"
			)

			.replace("%templateChannelType%", 
				log.data.channel ? log.data.channel.type 
				: "Not relevant"
			)
			.replace("%templateContent%",
				log.data.content !== undefined ? log.data.content === '' ? 'Empty' : log.data.content
				: log.data.customId ? log.data.customId // button
				: log.data.options ? `Parameters: ${JSON.stringify(log.data.options._hoistedOptions)}` // slash commands interaction
				: log.type === "guildMemberUpdate" ? "Not relevant"
				: "Unknown"
			)
			.replace("%templateEmbeds%",
				log.data.embeds?.length > 0 ? `${JSON.stringify(log.data.embeds)}`
				: "None"
			)
			.replace("%templateComponents%",
				log.data.components?.length > 0 ? `${JSON.stringify(log.data.components)}`
				: "None"
			)
	});

	const buffer = Buffer.from(logText, "utf8");
	return new MessageAttachment(buffer, "stack.log");
}

export const errorHandler: Function = async (client: Client, reason: any, type: string) => {
	console.error(`${err} ${reason.stack || JSON.stringify(reason)}`);

	// get dev log channel
	const channel = client.channels.cache.get(client.tokens.errorChannel) as TextChannel;
	if (channel === undefined) return; // avoid infinite loop when crash is outside of client

	if (lastReasons.length == loopLimit) lastReasons.pop(); // pop removes an item from the end of an array
	lastReasons.push(reason); // push adds one to the start

	//checks if every reasons are the same
	if (lastReasons.every((v) => v.stack == lastReasons[0].stack) && lastReasons.length == loopLimit) {
		if (client.verbose) console.log(`${err}Suspected crash loop detected; Restarting...`);

		const embed = new MessageEmbed()
			.setTitle("(Probably) Looped, crash encountered!")
			.setFooter({ text: `Got the same error ${loopLimit} times in a row. Attempting restart...` })
			.setDescription("```bash\n" + reason.stack + "\n```");
		await channel.send({ embeds: [embed] });

		client.restart();
	}

	const embed = new MessageEmbed()
		.setAuthor({ name: type, iconURL: `${client.config.images}bot/error.png` }) // much compressed than .title() & .thumbnail()
		.setColor(colors.red)
		.setTimestamp()
		.setFooter({ text: client.user.tag, iconURL: client.user.avatarURL() });

	await channel.send({ embeds: [embed] }).catch(console.error);
	await channel.send({ files: [logConstructor(client, reason)] }).catch(console.error); // send after because the file is displayed before the embed (embeds are prioritized)
};
