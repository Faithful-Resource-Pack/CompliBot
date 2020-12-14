uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'say',
	description: 'Make the bot send any message you specify',
	execute(client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ) {
      if (!args.length) return message.reply('You haven\'t specified a message to send!');
      else {
        message.delete().catch();
        message.channel.send(args.join(" "));
      }
    } else return
	}
};