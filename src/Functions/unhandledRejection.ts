import { MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import Client from '~/Client';
import Message from '~/Client/message';
import fs from 'fs';

const randomSentences: Array<string> = [
	'Oh no, not again!',
	"Well, it's unexpected...",
	'OOPS, sorry, my bad!',
	'I thought TS > JS was true...',
	'This one is going to be a nightmare to solve!',
	"Please, don't blame me, I try my best. Each day.",
	'Like humans, I have some errors',
	"Don't be sad, have a hug <3",
	'SCHEISE',
	'oh.',
	'Another one! DJ Khaleeeeed!',
	"I just don't know what went wrong :(",
	'My bad.',
	'Hold my beer.',
];

export const unhandledRejection: Function = async (client: Client, reason: any) => {
	const channel = client.channels.cache.get(client.config.channels.error) as TextChannel;

	const embed = new MessageEmbed()
		.setTitle('Unhandled Rejection')
		.setThumbnail(`${client.config.images}error.png`)
		.setColor(client.config.colors.red)
		.addField(
			'Last message(s) received:',
			`${client
				.getLastMessages()
				.map((message: Message, index) => `[Message ${index + 1}](${message.url}) - ${message.channel.type === 'DM' ? 'DM' : `<#${message.channel.id}>`}`)
				.join('\n')}`,
			false,
		)
		.setTimestamp()
		.setFooter({ text: client.user.tag, iconURL: client.user.avatarURL() });

	const logTemplate = fs.readFileSync(__dirname + '/unhandledRejection.log', { encoding: 'utf-8' });
	const messageTemplate = logTemplate.match(new RegExp(/\%messageStart%([\s\S]*?)%messageEnd/))[1]; // get message template

	const t = Math.floor(Math.random() * randomSentences.length);
	let log = logTemplate
		.replace('%date%', new Date().toUTCString())
		.replace('%stack%', reason.stack || JSON.stringify(reason))
		.replace('%randomSentence%', randomSentences[t])
		.replace('%randomSentenceUnderline%', '-'.repeat(randomSentences[t].length));

	log = log.split('%messageStart%')[0]; // remove message template

	client.getLastMessages().forEach((message: Message, index) => {
		log += messageTemplate
			.replace('%messageIndex%', index.toString())
			.replace('%messageCreatedTimestamp%', message.createdTimestamp.toString())
			.replace('%messageURL%', message.url)
			.replace('%messageChannelType%', message.channel.type)
			.replace('%messageContent%', message.content);
	});

	const buffer = Buffer.from(log, 'utf8');
	const attachment = new MessageAttachment(buffer, 'stack.log');

	await channel.send({ embeds: [embed] }).catch(console.error);
	await channel.send({ files: [attachment] }).catch(console.error);
	console.error(reason);
};
