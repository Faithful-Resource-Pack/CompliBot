const Discord  = require("discord.js");
const settings = require('../settings.js');
const speech = require('../messages.js');

uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'rules',
	description: 'Creates rules embed',
	execute(message, args) {
    if (message.author.id !== (uidR || uidJ)) return message.reply(speech.BOT_NO_PERMISSION).then(msg => {
          msg.delete({timeout: 30000});
          message.react('❌');
        });
    else {
     const embed = new Discord.MessageEmbed()
	  		.setTitle('Rules')
	  		.setColor(settings.C32Color)
	  		.setThumbnail(settings.C32IMG)
	  		.addFields(
				  { name: '1️⃣', value: 'Follow Discord TOS and Guidelines.'},
				  { name: '2️⃣', value: 'Be considerate of others.'},
          { name: '3️⃣', value: 'No advertising. This means no products or other Discord servers unless another user asks.'},
          { name: '4️⃣', value: 'No NSFW content, ie explicit photographs or graphic stories. Cursing is generally fine so long as it is not excessive.'},
          { name: '5️⃣', value: 'No spamming.'},
          { name: '6️⃣', value: 'Only ping `@Mods` when it is absolutely necessary.'},
          { name: '7️⃣', value: 'No politics.'},
          { name: '8️⃣', value: 'No hate speech. This includes racial slurs, sexual slurs, general derogatory names, etc.'},
          { name: '9️⃣', value: 'Respect channels for what they are made.'},
          { name: '1️⃣0️⃣', value: 'Don\'t ask to ask, just read FAQ first & ask after.'},
          { name: '1️⃣1️⃣', value: 'Stay on topic. There are multiple channels with different purposes for a reason.'},
          { name: '1️⃣2️⃣', value: 'Preferably no talk about why we moved, that is explained in #faq'}
		  	)
	  		.setFooter('The rules are subject to change, last edited: none', settings.C32IMG);

     message.channel.send(embed);
    }
  }
};