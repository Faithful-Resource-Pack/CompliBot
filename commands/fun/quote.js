/*const prefix = process.env.PREFIX;

const Discord  = require('discord.js');
const colors   = require('../../res/colors');

module.exports = {
	name: 'quote',
	description: 'Get a random quote!',
	guildOnly: false,
	uses: 'Anyone',
	syntax: `${prefix}quote`,
	async execute(client, message, args) {

		//const quotes = ['ok now im farting guys lol \n~ BellPepperBrian', 'Yeah it\'s sour cream mmm I love drinking sour cream out of a bowl \n~ Sei', 'test lol', 'I need more quotes'];
		const quotes = ['https://discord.com/channels/720677267424018526/782961082477445120/811159559669284884', 'https://discord.com/channels/720677267424018526/782961082477445120/810975508354301993'];

		var randomQuote = quotes[Math.floor(Math.random()*quotes.length)]
		var quoteMessage = await channel.messages.fetch(randomQuote);

		var embed = new Discord.MessageEmbed()
			.setTitle('Random quote:')
			.setColor(colors.BLUE)
			.setDescription(quoteMessage)
		
		await message.channel.send(embed);
	}
};*/
