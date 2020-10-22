/*const Discord     = require("discord.js");

module.exports = {
	name: 'role',
	description: 'Send notification roles message',
	execute(message, args) {
    const embed = new Discord.MessageEmbed()
	  		.setTitle('Notification Roles:')
        .setDescription('To recieve notifications for following roles, react to these emojis:')
	  		.setColor('#915E00')
        .addFields(
				  { name: '🛠️ = mod updates', value: '\u200B'},
				  { name: '💎 = general updates', value: '\u200B'},
		  	)
	  		.setFooter('Faithful Mods', 'https://i.imgur.com/scpOogK.png');

    message.channel.send({embed: embed}).then(embedMessage => {
        embedMessage.react('🛠️').then(() => {embedMessage.react('💎')});
    });
  }
};*/
