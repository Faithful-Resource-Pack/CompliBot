const prefix  = process.env.PREFIX;

const strings = require('../../resources/strings');

module.exports = {
	name: 'order',
	description: strings.HELP_DESC_ORDER,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}order <pizza/66/help/soup>`,
	example: `${prefix}order pizza`,
	async execute(client, message, args) {
    if (args == '66') return await message.channel.send("https://media1.tenor.com/images/fb7250a2ef993a37e9c7f48af760821c/tenor.gif");
		else if (args == 'help') return await message.channel.send('https://i.giphy.com/media/WNJGAwRW1LFG5T4qOs/giphy.webp');
		else if (args == 'pizza') {
			await message.inlineReply('Guten Appetit')
			return await message.channel.send('https://i0.wp.com/metro.co.uk/wp-content/uploads/2016/02/pizza-cheese.gif');
		}
		else if (args == 'soup') {
			await message.inlineReply('Guten Appetit')
			return await message.channel.send('https://tenor.com/view/sopita-de-fideo-noodle-soup-mexican-noodles-gif-15167113');
		}
		else if (args == 'ice') return await message.channel.send('https://london.frenchmorning.com/wp-content/uploads/sites/10/2019/02/glacons-boissons-choses-enervent-francais-londres.gif');
		else if (args == 'fire') return await message.channel.send('https://i.giphy.com/media/Qre4feuyNhiYIzD7hC/200.gif')
		
	}
};
