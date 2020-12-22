uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'behave',
	description: ':smirk:',
	uses: 'Bot Developers',
	syntax: `${prefix}behave`,

	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ) {
			await message.channel.send("I'm so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)");
		}
		else return
	}
};