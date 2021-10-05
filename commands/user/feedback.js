const prefix  = process.env.PREFIX;

const Discord = require("discord.js");
const colors  = require('../../resources/colors');
const strings = require('../../resources/strings');
const emojis  = require('../../resources/emojis')

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'feedback',
	description: strings.HELP_DESC_FEEDBACK,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}feedback [message]`,
	example: `${prefix}feedback Give the bot more beans`,
	async execute(client, message, args) {
		//const channel = client.channels.cache.get('821793794738749462');
		const channel = client.channels.cache.get('821793794738749462');
		let file

		if (!args[0]) return warnUser(message, strings.FEEDBACK_NO_ARGS_GIVEN);

		var embed = new Discord.MessageEmbed()
			.setAuthor(`Feedback from ${message.author.tag}`, message.author.displayAvatarURL())
			.setColor(colors.BLUE)
			.setDescription(`[Jump to message](${message.url})\n\n\`\`\`${args.join(' ')}\`\`\``)
			.setTimestamp()
		
		if (message.attachments.size > 0) {
			file = message.attachments.first().url
			if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('jpeg')) embed.setImage(file)
		}

		if (message.channel.type === 'DM') embed.addField('Channel:', '`Private message (DM)`')
		else {
			embed.addFields(
				{ name: 'Server:', value: `\`${message.guild.name}\`` },
				{ name: 'Channel:', value: `<#${message.channel.id}>` }
			)
		}

		var confirmEmbed = new Discord.MessageEmbed()
			.setColor(colors.BLUE)
			.setTitle(`Please confirm your feedback by reacting with <:upvote:${emojis.UPVOTE}>`)
			.setDescription('**Note:** Feedback that is not related to the bot will be ignored.')

		const confirmEmbedMsg = await message.reply({embeds: [confirmEmbed]});
		await confirmEmbedMsg.react(emojis.UPVOTE).catch(() => {});

		const filter = (reaction, user) => {
			return !user.bot && [emojis.UPVOTE].includes(reaction.emoji.id) && user.id === message.author.id;
		};

		confirmEmbedMsg.awaitReactions({filter, max: 1, time: 60000, errors: ['time'] })
		.then(async collected => {
			const reaction = collected.first()
			if (reaction.emoji.id === emojis.UPVOTE) {
				var embed2 = new Discord.MessageEmbed()
					.setColor(colors.BLUE)
					.setTitle(strings.FEEDBACK_SUCCESS_DESCRPTION)
					.setTimestamp()
	
				await channel.send({embeds: [embed]});
				await confirmEmbedMsg.edit({embeds: [embed2]});
				await confirmEmbedMsg.reactions.cache.get(emojis.UPVOTE).remove()

				//await feedbackMsg.react(emojis.UPVOTE).catch(() => {}); 
				//await feedbackMsg.react(emojis.DOWNVOTE).catch(() => {});
			}
		})
		.catch(async () => {
			try {
				if (message.channel.type !== 'DM') await confirmEmbedMsg.reactions.cache.get(emojis.UPVOTE).remove()
				var expiredEmbed = new Discord.MessageEmbed()
					.setColor(colors.RED)
					.setTitle('You didn\'t confirm your feedback in time.')
					.setDescription('Your feedback has not been sent.')
				
				await confirmEmbedMsg.edit({embeds: [expiredEmbed]});
			} catch (err) { /* Message deleted */ }
		})
	}
};
