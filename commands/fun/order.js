const prefix = process.env.PREFIX;

module.exports = {
	name: 'order',
	description: 'Order something',
	guildOnly: false,
	uses: 'Anyone',
	syntax: `${prefix}order <pizza/66/help>`,
	async execute(client, message, args) {
    	if (args == '66') await message.channel.send("https://media1.tenor.com/images/fb7250a2ef993a37e9c7f48af760821c/tenor.gif");
		else if (args == 'help') await message.channel.send('https://i.giphy.com/media/WNJGAwRW1LFG5T4qOs/giphy.webp');
    	else if (args == 'pizza') {
			await message.reply('Guten Appetit')
			await message.channel.send('https://i0.wp.com/metro.co.uk/wp-content/uploads/2016/02/pizza-cheese.gif');
		}
	}
};
