const speech = require('../messages');

module.exports = {
	name: 'clear',
	description: 'Clear messages in a channel',
	async execute(client, message, args) {

		if(message.member.roles.cache.find(r => r.name === "God") || message.member.roles.cache.find(r => r.name === "Moderator") || message.member.roles.cache.find(r => r.name === "Moderators") ||message.member.roles.cache.find(r => r.name === "Mods")) {
			if (args != '') {
				if (isNaN(args)) return await message.reply("the amount parameter isn't a number!");

				if (args > 200) return await message.reply("you can't delete more than 200 messages at once!"); 
				if (args < 1) return await message.reply('you have to delete at least 1 message!'); 

				var amount = parseInt(args, 10) + 1
				const messages = await message.channel.messages.fetch({ limit: amount });
				await message.channel.bulkDelete(messages);

			} else {
				await message.reply('please provide a number!');
			}
		} else {
			const msg = await message.reply(speech.BOT_NO_PERMISSION);
      await message.react('❌');
      await msg.delete({timeout: 30000});
		}
	}
};