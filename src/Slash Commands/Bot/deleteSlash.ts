import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import CommandInteraction from "@src/Client/commandInteraction";
import Client from "@src/Client";

export const command: SlashCommand = {
	permissions: {
		roles: undefined,
		users: ["207471947662098432", "473860522710794250", "173336582265241601", "601501288978448411"],
	},
	data: new SlashCommandBuilder().setName("delete-slash-command").setDescription("Remove global slash commands."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		await client.deleteGlobalSlashCommands();
		interaction.reply({ content: await interaction.text({ string: "Sucsess.General" }), ephemeral: true });
	},
};
