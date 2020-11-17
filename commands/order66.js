uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'order66',
	description: 'Do it',
	execute(message, args) {
    if (message.author.id === uidR || message.author.id === uidJ) {
		  message.channel.send("https://media1.tenor.com/images/fb7250a2ef993a37e9c7f48af760821c/tenor.gif");
    }
    else return
	}
};