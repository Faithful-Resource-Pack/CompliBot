import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, Message } from "@src/Extended Discord";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("love")
		.setDescription("Shows the love for someone else.")
		.addUserOption((user) => user.setName("user1").setDescription("The first lover."))
		.addUserOption((user) => user.setName("user2").setDescription("The second lover.")),
	execute: async (interaction: CommandInteraction) => {
		var lover1 = parseInt(interaction.options.getUser("user1").id.substring(12, 14)) / 2;
		var lover2 = parseInt(interaction.options.getUser("user2").id.substring(12, 14)) / 2;

		let embed = new MessageEmbed()
			.setTitle(`${interaction.options.getUser("user1").username} ❤️ ${interaction.options.getUser("user2").username}`)
			.setDescription(`${Math.trunc(lover1 + lover2)}%`);

		interaction.reply({ embeds: [embed], fetchReply: true }).then((message: Message) => message.deleteButton());
	},
};
