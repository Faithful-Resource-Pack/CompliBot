const prefix = process.env.PREFIX;

const strings = require('../res/strings');
const colors = require('../res/colors');
const { MessageEmbed } = require('discord.js');
const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'poll',
	description: 'Make a poll to ask people!',
	guildOnly: true,
	uses: 'Anyone',
	syntax: `${prefix}poll <time in seconds> | <title> | <option1> | <option2> | ...`,
	async execute(client, message, args) {

		if (message.content.includes(" | ")) {
			args = message.content.slice(prefix.length).trim().split(" | ");
			args[0] = args[0].replace('poll ','');

			if (isNaN(args[0]) || args[0] < 0 || args[0] > 3601) return warnUser(message, 'Time must be an integer between 0 & 3600 seconds!');

			options = []
			for (var i = 2; i < args.length; i++) {
				options[i-2] = args[i];
			}


			if (options.length == 2) pollEmbed(message, args[1], options, args[0], ['✅', '❌']);
			else pollEmbed(message, args[1], options, args[0]);

			return await message.delete();
		} else return warnUser(message, 'You must separate each argument with ``args1 | args2``')

	}
}

/*
 * THIS PART COMES FROM : https://github.com/saanuregh/discord.js-poll-embed/blob/master/index.js
 * Thanks to him!
*/
const defEmojiList = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮'];

const pollEmbed = async (msg, title, options, timeout = 30, emojiList = defEmojiList.slice(), forceEndPollEmoji = '🛑') => {
	if (!msg && !msg.channel) return warnUser(message, 'The channel is inaccessible!');
	if (!title) return warnUser(message, 'You didn\'t provide a poll title!');
	if (!options) return warnUser(message, 'You didn\t provide any poll options!');
	if (options.length < 2) return warnUser(message, 'Please provide more than one choice!');
	if (options.length > emojiList.length) return warnUser(message, `Please provide ${emojiList.length} or less choices!`);

	let time = `${timeout} seconds`;
	if (timeout > 60 && timeout < 3600) time = `${timeout / 60} minutes`;
	if (timeout == 3600) time = `${timeout/3600} hour`;

	let	text = `To vote, react using the correspoding emoji.\nThe voting will end in **${time}**.\nThe poll creator can end the poll **forcefully** by reacting with ${forceEndPollEmoji}\n\n`;
	
	const emojiInfo = {};
	for (const option of options) {
		const emoji = emojiList.splice(0, 1);
		emojiInfo[emoji] = { option: option, votes: 0 };
		text += `${emoji} : \`${option}\`\n\n`;
	}
	const usedEmojis = Object.keys(emojiInfo);
	usedEmojis.push(forceEndPollEmoji);

	const poll = await msg.channel.send(embedBuilder(title, msg.author.tag).setDescription(text));
	for (const emoji of usedEmojis) await poll.react(emoji);

	const reactionCollector = poll.createReactionCollector(
		(reaction, user) => usedEmojis.includes(reaction.emoji.name) && !user.bot,
		timeout === 0 ? {} : { time: timeout * 1000 }
	);
	const voterInfo = new Map();
	reactionCollector.on('collect', (reaction, user) => {
		if (usedEmojis.includes(reaction.emoji.name)) {
			if (reaction.emoji.name === forceEndPollEmoji && msg.author.id === user.id) return reactionCollector.stop();
			if (!voterInfo.has(user.id)) voterInfo.set(user.id, { emoji: reaction.emoji.name });
			const votedEmoji = voterInfo.get(user.id).emoji;
			if (votedEmoji !== reaction.emoji.name) {
				const lastVote = poll.reactions.get(votedEmoji);
				lastVote.count -= 1;
				lastVote.users.remove(user.id);
				emojiInfo[votedEmoji].votes -= 1;
				voterInfo.set(user.id, { emoji: reaction.emoji.name });
			}
			emojiInfo[reaction.emoji.name].votes += 1;
		}
	});

	reactionCollector.on('dispose', (reaction, user) => {
		if (usedEmojis.includes(reaction.emoji.name)) {
			voterInfo.delete(user.id);
			emojiInfo[reaction.emoji.name].votes -= 1;
		}
	});

	reactionCollector.on('end', () => {
		text = 'Time\'s up! The results are:\n\n';
		for (const emoji in emojiInfo) text += `\`${emojiInfo[emoji].option}\` - \`${emojiInfo[emoji].votes}\`\n\n`;
		poll.delete();
		msg.channel.send(embedBuilder(title, msg.author.tag).setDescription(text));
	});
};

const embedBuilder = (title, author) => {
	return new MessageEmbed()
		.setColor(colors.BLUE)
		.setTitle(`Poll: ${title}`)
		.setFooter(`Poll created by ${author}`);
};