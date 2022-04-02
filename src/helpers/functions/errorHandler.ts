import { ButtonInteraction, CommandInteraction, Guild, GuildMember, MessageAttachment, MessageEmbed, SelectMenuInteraction, TextChannel } from "discord.js";
import { Client, Message } from "@client";
import fs from "fs";
import { err } from "@helpers/logger";
import { colors } from "@helpers/colors";
import { Log } from "client/client";

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

export const errorHandler: Function = async (client: Client, reason: any, type: string) => {
	console.error(`${err} ${reason.stack || JSON.stringify(reason)}`);
	const channel = client.channels.cache.get(client.tokens.errorChannel) as TextChannel;
	if (channel === undefined) return; // avoid infinite loop when crash is outside of client

	if (lastReasons.length == loopLimit) lastReasons.pop(); // pop removes an item from the end of an array
	lastReasons.push(reason); // push adds one to the start

	//checks if every value is equal to index
	if (lastReasons.every((v) => v.stack == lastReasons[0].stack) && lastReasons.length == loopLimit) {
		if (client.verbose) console.log(`${err}Suspected loop detected; Restarting...`);
		const embed = new MessageEmbed()
			.setTitle("(Probably) Looped, error encountered!")
			.setFooter({ text: "Got the same error three times in a row. Atempting restart..." })
			.setDescription("```bash\n" + reason.stack + "\n```");
		await channel.send({ embeds: [embed] });
		client.restart(); // round 2 babyy
	}

	const embed = new MessageEmbed()
		.setTitle(type)
		.setThumbnail(`${client.config.images}bot/error.png`)
		.setColor(colors.red)
		.setTimestamp()
		.setFooter({ text: client.user.tag, iconURL: client.user.avatarURL() });

	const logTemplate = fs.readFileSync(__dirname + "/errorHandler.log", { encoding: "utf-8" });
	const template = logTemplate.match(new RegExp(/\%templateStart%([\s\S]*?)%templateEnd/))[1]; // get message template

	const t = Math.floor(Math.random() * randomSentences.length);
	let logText = template
		.replace("%date%", new Date().toUTCString())
		.replace("%stack%", reason.stack || JSON.stringify(reason))
		.replace("%randomSentence%", randomSentences[t])
		.replace("%randomSentenceUnderline%", "-".repeat(randomSentences[t].length));

	logText = logText.split("%messageStart%")[0]; // remove message template

	client.getAction().forEach((log: Log, index) => {
		logText += template
			.replace("%templateIndex%", index.toString())
			.replace("%templateType%", log.type)
			.replace("%templateCreatedTimestamp%", log.data.createdTimestamp.toString())
			.replace("%templateURL%", log.data.url)
			.replace("%templateChannelType%", log.data.channel.type)
			.replace("%templateContent%", log.data.content)
	});

	const buffer = Buffer.from(logText, "utf8");
	const attachment = new MessageAttachment(buffer, "stack.log");

	await channel.send({ embeds: [embed] }).catch(console.error);
	await channel.send({ files: [attachment] }).catch(console.error);
};
