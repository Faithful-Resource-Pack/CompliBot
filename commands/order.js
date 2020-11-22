uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'order',
	description: 'order something',
	execute(message, args) {
    if (args == '66') {
		  message.channel.send("https://media1.tenor.com/images/fb7250a2ef993a37e9c7f48af760821c/tenor.gif");
    }
    else if (args == 'pizza') {
			message.reply('Guten Appetit')
			message.channel.send('https://i0.wp.com/metro.co.uk/wp-content/uploads/2016/02/pizza-cheese.gif');
		}
		else if (args == 'help') {
			message.channel.send('https://i.giphy.com/media/WNJGAwRW1LFG5T4qOs/giphy.webp');
		}
	}
};