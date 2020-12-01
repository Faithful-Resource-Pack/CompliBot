uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'behave',
	description: 'yes',
	execute(message, args) {
		if (message.author.id === uidR || message.author.id === uidJ) {
			message.channel.send("I'm so sorry! (⌯˃̶᷄ ﹏ ˂̶᷄⌯)");
		}
		else return
	}
};