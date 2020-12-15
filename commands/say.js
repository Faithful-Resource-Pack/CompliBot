uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'say',
	description: 'Make the bot send any message you specify',
	async execute(client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ) {
      if (!args.length) return await message.reply('You haven\'t specified a message to send!');
      else {
        await message.delete().catch();
        await message.channel.send(args.join(" "));
      }
    } else return
	}
};