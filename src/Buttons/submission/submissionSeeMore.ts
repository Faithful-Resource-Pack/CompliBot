import { Button } from "@src/Interfaces";
import { Client, Message, ButtonInteraction } from "@src/Extended Discord";
import { submissionButtonsOpen, submissionButtonsVotes } from "@helpers/buttons";

export const button: Button = {
  buttonId: "submissionSeeMore",
  execute: async (client: Client, interaction: ButtonInteraction) => {
    const message: Message = interaction.message as Message;
    message.edit({ components: [submissionButtonsOpen, submissionButtonsVotes] })

    try {
      interaction.update({});
    } catch (err) {
      console.error(err);
    }
  }
}