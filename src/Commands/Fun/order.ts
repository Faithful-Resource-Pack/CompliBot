import MessageEmbed from '~/Client/embed';
import { Command } from '~/Interfaces';

export const command: Command = {
	name: 'order',
	description: 'get yourself some snacks!',
	usage: ['order (secret yummy snack)'],
	run: async (client, message, args) => {
		if (args.length != 1) return message.reply('Sorry could you repeat your order?');

		switch (args[0]) {
			case '66':
				return message.reply('https://media1.tenor.com/images/fb7250a2ef993a37e9c7f48af760821c/tenor.gif');
			case 'help':
				return message.reply('https://i.giphy.com/media/WNJGAwRW1LFG5T4qOs/giphy.webp');
			case 'pizza':
				message.reply('Buon Appetito');
				return message.channel.send('https://i0.wp.com/metro.co.uk/wp-content/uploads/2016/02/pizza-cheese.gif');
			case 'soup':
				message.reply('Guten Appetit');
				return message.channel.send('https://tenor.com/view/sopita-de-fideo-noodle-soup-mexican-noodles-gif-15167113');
			case 'ice':
				return message.reply('https://london.frenchmorning.com/wp-content/uploads/sites/10/2019/02/glacons-boissons-choses-enervent-francais-londres.gif');
			case 'fire':
				return message.reply('https://i.giphy.com/media/Qre4feuyNhiYIzD7hC/200.gif');
			case 'burger':
				return message.reply('https://c.tenor.com/tdFqDJemKpUAAAAC/mcdonalds-big-mac.gif');
			case 'poop':
				return message.reply('https://c.tenor.com/RrkaJ9JlVUgAAAAC/cake-eat.gif');
			default:
				return message.reply("Sorry could you repeat your order? I can't see that on the menu...");
		}
	},
};
//https://c.tenor.com/RrkaJ9JlVUgAAAAC/cake-eat.gif
