const Discord     = require("discord.js");
const EMBED_COLOR = '#E1631F';

module.exports = {
	name: 'ping',
	description: 'Pong!',
	execute(message, args) {
		message.channel.send('Pinging...').then(m => {
      var ping = m.createdTimestamp - message.createdTimestamp;

      var embed = new Discord.MessageEmbed()
        .setTitle('Your ping is:')
        .setDescription('**' + ping + 'ms**')
        .setColor(EMBED_COLOR)
        .setFooter('Faithful Dungeons', 'https://i.imgur.com/ldI5hDM.png');

      m.edit(embed);
    });
	},
};