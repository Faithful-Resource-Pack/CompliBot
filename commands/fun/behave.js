const prefix = process.env.PREFIX;

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

module.exports = {
	name: 'behave',
	description: '(⌯˃̶᷄ ﹏ ˂̶᷄⌯)',
	uses: 'Bot Developers',
	syntax: `${prefix}behave`,

	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {
			await message.channel.send("I'm so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)");
		}
		else return
	}
};
