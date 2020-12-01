const Discord  = require("discord.js");
const settings = require('../settings.js');

module.exports = {
	name: 'faq',
	description: 'FAQ commands for Compliance Tweaks',
	execute(message, args) {
		if (message.guild.id !== settings.CTweaksID) return message.reply('this command can only be used in the Compliance Tweaks server!')
			.then(msg => {
				msg.delete({timeout: 30000});
				message.react('❌');
			});
		else if (!args.length) return message.channel.send(`You didn't provide any arguments, ${message.author}!`)
			.then(msg => {
				msg.delete({timeout: 30000});
				message.react('❌');
			});
		else if (args[0] === 'f32') {
			const embed = new Discord.MessageEmbed()
				.setTitle('What is Compliance 32x?')
				.setColor(settings.CTweaksColor)
				.addField('You\'ll find your answer in #faq, or the message linked below.', 'https://discordapp.com/channels/720966967325884426/720967169898315819/754028980604108800')
				.setFooter('Compliance Tweaks', settings.CTweaksIMG);

			message.channel.send(embed);
		}
		else if (args[0] === 'vt') {
			const embed = new Discord.MessageEmbed()
				.setTitle('What is Vanilla Tweaks?')
				.setColor(settings.CTweaksColor)
				.addField('You\'ll find your answer in #faq, or the message linked below.', 'https://discordapp.com/channels/720966967325884426/720967169898315819/754029099969806487')
				.setFooter('Compliance Tweaks', settings.CTweaksIMG);

			message.channel.send(embed);
		}
		else if (args[0] === 'download') {
			const embed = new Discord.MessageEmbed()
				.setTitle('Where Can I Get Compliance Tweaks?')
				.setColor(settings.CTweaksColor)
				.addField('You\'ll find your answer in #faq, or the message linked below.', 'https://discordapp.com/channels/720966967325884426/720967169898315819/754029219486498939')
				.setFooter('Compliance Tweaks', settings.CTweaksIMG);

			message.channel.send(embed);
		}
		else if (args[0] === 'contribute') {
			const embed = new Discord.MessageEmbed()
				.setTitle('Can I Help Create Compliance Tweaks?')
				.setColor(settings.CTweaksColor)
				.addField('You\'ll find your answer in #faq, or the message linked below.', 'https://discordapp.com/channels/720966967325884426/720967169898315819/754029320028291263')
				.setFooter('Compliance Tweaks', settings.CTweaksIMG);

			message.channel.send(embed);
		}
		else if (args[0] === 'suggestions') {
			const embed = new Discord.MessageEmbed()
				.setTitle('Can I give suggestions?')
				.setColor(settings.CTweaksColor)
				.addField('You\'ll find your answer in #faq, or the message linked below.', 'https://discordapp.com/channels/720966967325884426/720967169898315819/754029420750176367')
				.setFooter('Compliance Tweaks', settings.CTweaksIMG);

			message.channel.send(embed);
		}
		else if (args[0] === 'bedrock') {
			const embed = new Discord.MessageEmbed()
				.setTitle('Will Compliance Tweaks Support Bedrock?')
				.setColor(settings.CTweaksColor)
				.addField('You\'ll find your answer in #faq, or the message linked below.', 'https://discordapp.com/channels/720966967325884426/720967169898315819/754029890323349544')
				.setFooter('Compliance Tweaks', settings.CTweaksIMG);

			message.channel.send(embed);
		}
		else {
			message.channel.send(`The argument you provided doesn\'t exist, ${message.author}!`)
			.then(msg => {
				msg.delete({timeout: 30000});
				message.react('❌');
			});
		}
	}
};