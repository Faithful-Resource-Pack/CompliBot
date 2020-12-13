/*const Discord     = require("discord.js");

module.exports = {
	name: 'role',
	description: 'Send notification roles message',
	execute(client, message, args) {
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

        const filter = (reaction, user) => {
			    return ['🛠️', '💎'].includes(reaction.emoji.name) && user.id === message.author.id;
	    	};
        
        embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			    .then(collected => {
				    const reaction = collected.first();

				    if (reaction.emoji.name === '🛠️') {
				    	message.reply('you reacted with the first emoji');
				    } else {
				    	message.reply('you reacted with the second emoji');
				    }
			    })
			    .catch(collected => {
				    console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
			});
    });
  }
};*/
