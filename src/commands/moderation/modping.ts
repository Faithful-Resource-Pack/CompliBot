import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Client, Message, MessageEmbed } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("modping")
		.setDescription("Ping a moderator")
		.addBooleanOption((option) =>
			option
				.setName("urgent")
				.setDescription("Does it require all moderator's attention? consequences will be handed for misuse")
				.setRequired(false),
		),
	execute: async (interaction: CommandInteraction, client: Client) => {
		let urgent = interaction.options.getBoolean("urgent");
		let modRole = interaction.guild.roles.cache.find((role) => role.name.toLocaleLowerCase().includes("mod"));

		// sorts by role hierarchy
		interaction.guild.roles.cache
			.filter((role) => role.name.toLocaleLowerCase().includes("mod"))
			.forEach((role) => {
				if (role.id == modRole.id) return false;
				if (role.position > modRole.position) {
					modRole = role;
					return true;
				}
			});

		if (modRole === undefined)
			return interaction.reply({
				content: await interaction.text({ string: "Command.Modping.NoRole" }),
				ephemeral: true,
			});

		const moderatorIDs = modRole.members.map((member) => member.user.id);
		const embed = new MessageEmbed().setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() });

		if (urgent) {
			embed.setDescription(await interaction.text({ string: "Command.Modping.Urgent" }));
			return interaction.reply({ embeds: [embed], content: `<@&${modRole.id}>` });
		}

		if (moderatorIDs !== []) {
			let onlineModIDs: string[] = [];
			let dndModIDs: string[] = [];

			moderatorIDs.forEach((id) => {
				const mod = interaction.guild.members.cache.get(id);
				const status = mod.presence ? mod.presence.status : "offline";

				if (status != "offline") {
					switch (status) {
						case "dnd":
						case "idle":
							return dndModIDs.push(`<@!${id}>`);
						case "online":
							return onlineModIDs.push(`<@!${id}>`);
					}
				}
			});
			if (onlineModIDs.length > 0) {
				embed.setDescription(
					await interaction.text({
						string: "Command.Modping.Online",
						placeholders: {
							NUMBER: `${
								moderatorIDs.length == 1
									? await interaction.text({ string: "General.Is" })
									: await interaction.text({ string: "General.Are" })
							} **${onlineModIDs.length}**`,
						},
					}),
				);
				return interaction.reply({ embeds: [embed], content: onlineModIDs.join(", ") });
			}
			if (dndModIDs.length > 0) {
				embed.setDescription(
					await interaction.text({
						string: "Command.Modping.AfkDnd",
						placeholders: {
							NUMBER: `${
								moderatorIDs.length == 1
									? await interaction.text({ string: "General.Is" })
									: await interaction.text({ string: "General.Are" })
							} **${moderatorIDs.length}**`,
						},
					}),
				);
				return interaction.reply({ embeds: [embed], content: dndModIDs.join(", ") });
			}
			if (dndModIDs.length + onlineModIDs.length == 0) {
				embed.setDescription(await interaction.text({ string: "Command.Modping.Offline" }));
				return interaction.reply({ embeds: [embed], content: `<@&${modRole.id}>` });
			}
		}
		//if no one has the role somehow lol
		embed.setDescription(await interaction.text({ string: "Command.Modping.Offline" }));
		return interaction.reply({ embeds: [embed], content: `<@&${modRole.id}>` });
	},
};
