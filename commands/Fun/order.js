const prefix = process.env.PREFIX
const strings = require('../../resources/strings.json')

module.exports = {
	name: 'order',
	description: strings.command.description.order,
	category: 'Fun',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}order <pizza/66/help/soup>`,
	example: `${prefix}order pizza`,
	async execute(client, message, args) {
		if (args == '66') return await message.channel.send({ content: 'https://media1.tenor.com/images/fb7250a2ef993a37e9c7f48af760821c/tenor.gif' });
		else if (args == 'help') return await message.channel.send({ content: 'https://i.giphy.com/media/WNJGAwRW1LFG5T4qOs/giphy.webp' });
		else if (args == 'pizza') {
			await message.reply({ content: 'Guten Appetit' })
			return await message.channel.send({ content: 'https://tenor.com/view/pizza-cooking-gif-9957360' });
		}
		else if (args == 'soup') {
			await message.reply({ content: 'Guten Appetit' })
			return await message.channel.send({ content: 'https://tenor.com/view/wonton-soup-gif-9902358' });
		}
		else if (args == 'butler') return await message.channel.send({ content: 'https://tenor.com/view/alfred-batman-butler-batman-animated-gif-9005410' });
		else if (args == 'ice') return await message.channel.send({ content: 'https://tenor.com/view/glacon-ice-melt-gif-5821993' });
		else if (args == 'fire') return await message.channel.send({ content: 'https://tenor.com/view/fire-lit-bonfire-flames-gif-12491054' })
		else if (args == 'burger') {
			await message.reply({ content: 'Guten Appetit' })
			return await message.channel.send({ content: 'https://tenor.com/view/burger-food-gif-8669971' })

	}
};
