import { Button } from "@src/Interfaces";
import { Client, Message, ButtonInteraction, MessageEmbed } from "@src/Extended Discord";
import { ids, parseId } from "@helpers/emojis";

export const button: Button = {
  buttonId: "submissionInvalidate",
  execute: async (client: Client, interaction: ButtonInteraction) => {
    const message: Message = interaction.message as Message;

    const embed = message.embeds[0];
    embed.fields.forEach(field => {
      if (field.name === "Status") field.value = `${parseId(ids.invalid)} Invalidated by <@!${interaction.user.id}>`
    })

    message.edit({ embeds: [embed] })

    try {
      interaction.update({});
    } catch (err) {
      console.error(err);
    }
  }
}