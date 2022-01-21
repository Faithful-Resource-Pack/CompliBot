import { MessageAttachment, MessageEmbed, TextChannel } from "discord.js";
import Client from "@src/Client";
import Message from "@src/Client/message";
import fs from "fs";
import { err } from "@src/Helpers/logger";

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

export const errorHandler: Function = async (client: Client, reason: any, type: string) => {
	const channel = client.channels.cache.get(client.config.channels.error) as TextChannel;

	const embed = new MessageEmbed()
		.setTitle(type)
		.setThumbnail(`${client.config.images}error.png`)
		.setColor(client.config.colors.red)
		.addField(
			"Last message(s) received:",
			`${client
				.getLastMessages()
				.map(
					(message: Message, index) =>
						`[Message ${index + 1}](${message.url}) - ${
							message.channel.type === "DM" ? "DM" : `<#${message.channel.id}>`
						}`,
				)
				.join("\n")}`,
			false,
		)
		.setTimestamp()
		.setFooter({ text: client.user.tag, iconURL: client.user.avatarURL() });

	const logTemplate = fs.readFileSync(__dirname + "/errorHandler.log", { encoding: "utf-8" });
	const messageTemplate = logTemplate.match(new RegExp(/\%messageStart%([\s\S]*?)%messageEnd/))[1]; // get message template

	const t = Math.floor(Math.random() * randomSentences.length);
	let log = logTemplate
		.replace("%date%", new Date().toUTCString())
		.replace("%stack%", reason.stack || JSON.stringify(reason))
		.replace("%randomSentence%", randomSentences[t])
		.replace("%randomSentenceUnderline%", "-".repeat(randomSentences[t].length));

	log = log.split("%messageStart%")[0]; // remove message template

	client.getLastMessages().forEach((message: Message, index) => {
		log += messageTemplate
			.replace("%messageIndex%", index.toString())
			.replace("%messageCreatedTimestamp%", message.createdTimestamp.toString())
			.replace("%messageURL%", message.url)
			.replace("%messageChannelType%", message.channel.type)
			.replace("%messageContent%", message.content);
	});

	const buffer = Buffer.from(log, "utf8");
	const attachment = new MessageAttachment(buffer, "stack.log");

	await channel.send({ embeds: [embed] }).catch(console.error);
	await channel.send({ files: [attachment] }).catch(console.error);
	console.error(`${err}${reason}`);
};
