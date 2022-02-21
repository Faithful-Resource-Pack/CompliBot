import { Button } from "@src/Interfaces";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@src/Extended Discord";
import { ids, parseId } from "@helpers/emojis";
import { EmbedField, GuildMember, Role } from "discord.js";
import { submissionsButtons } from "@helpers/buttons";
import { colors } from "@helpers/colors";

export const button: Button = {
  buttonId: "submissionInstapass",
  execute: async (client: Client, interaction: ButtonInteraction) => {
    const message: Message = interaction.message as Message;
		const member: GuildMember = interaction.member as GuildMember;

		// check if member is council
		if (member.roles.cache.find((role: Role) => Object.values(client.config.roles.council).includes(role.id)) === undefined) 
			return interaction.reply({
				content: "This interaction is reserved to council members",
				ephemeral: true
			})

    const embed: MessageEmbed = message.embeds[0];
		embed.setColor(colors.yellow);
		embed.fields.forEach((field: EmbedField) => {
			if (field.name === "Status") field.value = `${parseId(ids.instapass)} Instapassed by <@!${interaction.user.id}>`;
		});

    // remove the until field as we doesn't needs it anymore
    embed.fields = embed.fields.filter((field: EmbedField) => field.name !== "Until");

    message.edit({ embeds: [embed], files: [...message.attachments.values()], components: [submissionsButtons] });

		try {
			interaction.update({});
		} catch (err) {
			console.error(err);
		}

    // todo: ADD CONTRIBUTION CREATION TROUGH API & COMMIT FILE TO GITHUB (ALL BRANCHES + CORRESPONDING REPO)
  }
}