const client = require("../index").Client;

const { MessageEmbed } = require("discord.js");

const MAINTENANCE = process.env.MAINTENANCE.toLowerCase() == "true";
const PREFIX = process.env.PREFIX;

const strings = require("../resources/strings.json");
const settings = require("../resources/settings.json");

const submitTexture = require("../functions/submission/submitTexture");

const addDeleteButton = require("../helpers/addDeleteButton");
const warnUser = require("../helpers/warnUser");

module.exports = {
	name: "messageCreate",
	async execute(message) {
		// Ignore bot messages
		if (message.author.bot) return;

		/**
		 * COMMAND HANDLER
		 */
		if (message.content.startsWith(PREFIX)) {
			if (MAINTENANCE && !process.env.DEVELOPERS.includes(message.author.id)) {
				const msg = await message.reply({ content: strings.command.maintenance });
				await message.react(settings.emojis.downvote);
				if (message.deletable) setTimeout(() => msg.delete(), 30000);
			}

			const args = message.content.toLowerCase().slice(PREFIX.length).trim().split(/ +/);
			const commandName = args.shift().toLowerCase();
			const command =
				client.commands.get(commandName) ||
				client.commands.find((cmd) => cmd.aliases?.includes(commandName));

			if (!command) return; // stops a dev error being thrown every single time a message starts with a slash
			if (command?.guildOnly && message.channel.type === "DM")
				return warnUser(message, strings.bot.cant_dm);

			try {
				await command.execute(client, message, args);
			} catch (error) {
				console.trace(error);

				const embed = new MessageEmbed()
					.setColor(settings.colors.red)
					.setTitle(strings.bot.error)
					.setThumbnail(settings.images.error)
					.setDescription(
						`${strings.command.error}\nError for the developers:\n\`\`\`${error}\`\`\``,
					);

				let msgEmbed = await message.reply({ embeds: [embed] });
				await message.react(settings.emojis.downvote);
				return await addDeleteButton(msgEmbed);
			}
		} else {
			/**
			 * TEXTURE SUBMISSION
			 */
			const submissionChannels = Object.values(settings.submission.packs).map(
				(i) => i.channels.submit,
			);
			if (submissionChannels.includes(message.channel.id)) return submitTexture(client, message);

			/**
			 * CLASSIC FAITHFUL ADD-ON CHANNEL REACTIONS
			 */
			if (
				message.channel.id === "814631514523435020" ||
				message.channel.id === "995033923304308836"
			) {
				if (!message.attachments.size) {
					if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return;
					const embed = new MessageEmbed()
						.setThumbnail(settings.images.warning)
						.setColor(settings.colors.red)
						.setTitle(strings.submission.autoreact.error_title)
						.setDescription(strings.submission.no_file_attached)
						.setFooter({
							text: strings.submission.autoreact.error_footer,
							iconURL: client.user.displayAvatarURL(),
						});

					const msg = await message.reply({ embeds: [embed] });
					await addDeleteButton(msg);
					if (msg.deletable) setTimeout(() => msg.delete(), 30000);
					if (message.deletable) setTimeout(() => message.delete(), 10);
				} else {
					await message.react(settings.emojis.upvote);
					await message.react(settings.emojis.downvote);
				}
			}
		}
	},
};
