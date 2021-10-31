const prefix = process.env.PREFIX

const Discord = require("discord.js")
const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')

const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'feedback',
	aliases: ['suggest', 'bugreport'],
	description: strings.command.description.feedback,
	category: 'Bot',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}feedback [message]`,
	example: `${prefix}feedback Give the bot more beans`,
	async execute(client, message, args) {
		const channel = client.channels.cache.get('821793794738749462');
		let file

		if (!args[0]) return warnUser(message, strings.command.feedback.no_args_given);

		var embed = new Discord.MessageEmbed()
			.setAuthor(`Feedback from ${message.author.tag}`, message.author.displayAvatarURL())
			.setColor(settings.colors.blue)
			.setTimestamp()

		if (message.channel.type === 'DM')
			embed.setDescription(`\`\`\`${args.join(' ')}\`\`\``)
		else
			embed.setDescription(`[Jump to message](${message.url})\n\n\`\`\`${args.join(' ')}\`\`\``)

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
			.setColor(settings.colors.blue)
			.setTitle(`Please confirm your feedback by reacting with <:upvote:${settings.emojis.upvote}>`)
			.setDescription('**Note:** Feedback that is not related to the bot will be ignored.')

		const confirmEmbedMsg = await message.reply({ embeds: [confirmEmbed] });
		await confirmEmbedMsg.react(settings.emojis.upvote).catch(() => { });

		const filter = (reaction, user) => {
			return !user.bot && [settings.emojis.upvote].includes(reaction.emoji.id) && user.id === message.author.id;
		};

		confirmEmbedMsg.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first()
				if (reaction.emoji.id === settings.emojis.upvote) {
					var embed2 = new Discord.MessageEmbed()
						.setColor(settings.colors.blue)
						.setTitle(strings.command.feedback.success_description)
						.setTimestamp()

					await channel.send({ embeds: [embed] });
					await confirmEmbedMsg.edit({ embeds: [embed2] });
					if (message.channel.type !== 'DM') await confirmEmbedMsg.reactions.cache.get(settings.emojis.upvote).remove()

					//await feedbackMsg.react(settings.emojis.upvote).catch(() => {}); 
					//await feedbackMsg.react(settings.emojis.downvote).catch(() => {});
				}
			})
			.catch(async () => {
				try {
					if (message.channel.type !== 'DM') await confirmEmbedMsg.reactions.cache.get(settings.emojis.upvote).remove()
					var expiredEmbed = new Discord.MessageEmbed()
						.setColor(settings.colors.red)
						.setTitle('You didn\'t confirm your feedback in time.')
						.setDescription('Your feedback has not been sent.')

					await confirmEmbedMsg.edit({ embeds: [expiredEmbed] });
				} catch (err) { /* Message deleted */ }
			})
	}
};
