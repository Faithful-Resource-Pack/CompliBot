const Discord  = require('discord.js');
const settings = require('../settings');
const colors   = require('../res/colors');

async function quote(msg) {
	const args = msg.content.split(' ');

	for (var i = 0; i < args.length; i++) {
		if (args[i].startsWith('https://discord.com/channels/')) {
			var ids = new URL(args[i]).pathname.replace('/channels/','').replace('message','').split('/');
			break;
		}
	}

	if (msg.guild.id == ids[0]) {
		let channel = msg.guild.channels.cache.get(ids[1]);
		let message = await channel.messages.fetch(ids[2]);

		if (message.embeds[0] !== undefined) {
			var embed = new Discord.MessageEmbed()
				.setColor(colors.BLUE)
				.setAuthor(`Message posted by ${message.author.tag}`, settings.QUOTE_IMG)
				.setTitle(message.embeds[0])
		}

		else {
			var embed = new Discord.MessageEmbed()
				.setColor(colors.BLUE)
				.setAuthor(`Message posted by ${message.author.tag}`, settings.QUOTE_IMG)
				.setThumbnail(message.author.displayAvatarURL())
				.setDescription(message.content)
				.setFooter(`Quoted by ${msg.author.tag}`, msg.author.displayAvatarURL());

			if (message.attachments.size > 0) {
				var file = message.attachments.first().url;
				if (file.endsWith('.png')) embed.setImage(file);
			} 
			else {
				const messageArgs = message.content.split(' ');
				for (var i = 0; i < messageArgs.length; i++) {
					if (messageArgs[i].startsWith('https://') && (messageArgs[i].endsWith('.gif') || messageArgs[i].endsWith('.gif?'))) {
						embed.setImage(messageArgs[i]);
						embed.setDescription(message.content.replace(messageArgs[i], ''));
						break;
					}
				}
			}

			return await msg.channel.send(embed);
		}
	}

	
}

exports.quote = quote;