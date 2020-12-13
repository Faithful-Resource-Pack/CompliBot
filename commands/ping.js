const Discord  = require('discord.js');
const settings = require('../settings.js');

module.exports = {
	name: 'ping',
	description: 'Pong!',
	execute(client, message, args) {
    const m = new Discord.MessageEmbed().setTitle('Ping?')

    message.channel.send(m).then(m => {
    const embed = new Discord.MessageEmbed()
      .setTitle('Pong!')
      .setDescription(`Latency: ${m.createdTimestamp - message.createdTimestamp}ms \nAPI Latency: ${Math.round(message.client.ws.ping)}ms`)
      .setFooter('CompliBot', settings.BotIMG);
     m.edit(embed);
    })
	}
};