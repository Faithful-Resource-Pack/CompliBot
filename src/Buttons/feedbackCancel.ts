import Client from "@src/Client";
import MessageEmbed from "@src/Client/embed";
import Message from "@src/Client/message";
import { ButtonInteraction } from "@src/Client/interaction";
import { Button } from "@src/Interfaces/buttonEvent";
import { MessageInteraction } from "discord.js";

export const button: Button = {
	buttonId: "feedbackCancel",
	execute: async (client: Client, interaction: ButtonInteraction) => {
    const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
    const message: Message = interaction.message as Message;

    if (interaction.user.id !== messageInteraction.user.id) return interaction.reply({
      content: `This interaction is reserved to its owner (<@!${messageInteraction.user.id}>)`,
      ephemeral: true
    })

    await interaction.reply({ content: "Feedback canceled!", ephemeral: true });
    
    try {
      message.delete();
    } catch (_err) { /* message already deleted */ }
  } 
}