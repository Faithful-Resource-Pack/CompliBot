import { MessageEmbed } from 'discord.js';
import ExtendedMessage from '~/Client/message';
import { Command } from '~/Interfaces';

const answers = [
	'Yes',
	'Yes.',
	'Yes?',
	'Yes!',
	'No',
	'No.',
	'No?',
	'No!',
	'Maybe',
	'Maybe not',
	'Probably',
	'Probably not',
	"I don't know",
	'True',
	'False',
	"I'll think about it",
	'Could you rephrase that',
	"I'm sure of it",
	"I'm not sure",
	'Of course',
	'Of course not',
	'Question too vague',
	'Definitely',
	'Definitely not',
	'Totally not',
	'Totally',
	'It is impossible',
	'It is possible',
	'It is decidedly so',
	'Possibly',
	'Possibly not',
	'Try asking again',
	'Up to you',
	'¯_(ツ)_/¯',
	'Not really',
	'Absolutely',
	'Absolutely not',
	'It is decidedly so',
	'Sure',
	'It is certain',
	'Without a doubt',
	'Yes definitely',
	'You may rely on it',
	'As I see it, yes',
	'Most likely',
	'Outlook good',
	'Signs point to yes',
	'Reply hazy try again',
	'Ask again later',
	'Better not tell you now',
	'Cannot predict now',
	'Concentrate and ask again',
	"Don't count on it",
	'My reply is no',
	'My sources say no',
	'Outlook not so good',
	'Very doubtful',
];

export const command: Command = {
	name: 'ball',
	description: 'not implemented yet',
	usage: ['ball <question>'],
	run: async (client, message, args) => {
		if (!args.length) return message.warn('No args given');

		var embed = new MessageEmbed()
			.setTitle(answers[Math.floor(Math.random() * answers.length)])
			.setColor('BLURPLE');

		// special replies
		if (args.join(' ') == 'balls') embed.setTitle('lol');
		else if (args.join(' ').includes('sentient')) embed.setTitle('Yes.');

		const res = await message.reply({ embeds: [embed] });
		res.deleteReact({ authorMessage: message, deleteAuthorMessage: true })
	},
};
