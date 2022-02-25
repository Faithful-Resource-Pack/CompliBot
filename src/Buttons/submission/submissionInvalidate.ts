import { Button } from "@src/Interfaces";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@src/Extended Discord";
import { ids, parseId } from "@helpers/emojis";
import { EmbedField, GuildMember, Role } from "discord.js";
import { submissionsButtons } from "@helpers/buttons";
import { colors } from "@helpers/colors";
import { Submission } from "@helpers/class/submissions";

export const button: Button = {
	buttonId: "submissionInvalidate",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		const message: Message = interaction.message as Message;
    const embed: MessageEmbed = message.embeds[0];
		const member: GuildMember = interaction.member as GuildMember;

		// check if member is council
		if (member.roles.cache.find((role: Role) => Object.values(client.config.roles.council).includes(role.id)) === undefined) 
			return interaction.reply({
				content: "This interaction is reserved to council members",
				ephemeral: true
			})

		// get submission, update it, delete it (no needs to keep it in memory since it has ended the submission process)
		const sid: string = embed.footer.text.split(" | ")[0];
		const submission: Submission = new Submission(client.submissions.get(sid));
		
		submission.setStatus("invalid", client);
		await submission.updateSubmissionMessage(client, interaction.user.id);

		client.submissions.delete(sid);

		try {
			interaction.update({});
		} catch (err) {
			console.error(err);
		}
	},
};
