import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Message, MessageEmbed } from "@src/Extended Discord";
import { EmbedField, GuildMember, Role } from "discord.js";
import { ids, parseId } from "@helpers/emojis";
import { Config } from "@interfaces/config";
import ConfigJson from "@/config.json";
const config: Config = ConfigJson;

export const command: SlashCommand = {
  permissions: {
    roles: Object.values(config.roles.council)
  },
  data: new SlashCommandBuilder()
		.setDefaultPermission(false) // disable the command for @everyone (only council can do it)
    .setName("reason")
    .setDescription("Set reason for submission invalidation/deny!")
    .addStringOption(option => 
      option
        .setName("message_id")
        .setDescription("Submission message ID you want to add a reason.")
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName("reason")
        .setDescription("Reason of the invalidation/deny.")
        .setRequired(true)
    )
    ,
  execute: async (interaction: CommandInteraction) => {
    let isInvalidated: boolean = false;
    console.log(Object.values(config.roles.council));

    interaction.channel.messages.fetch(interaction.options.getString("message_id", true))
      .then(async (message: Message) => {
        const embed: MessageEmbed = message.embeds[0];
        embed.fields.forEach((field: EmbedField) => {
          if (field.name === "Reason") {
            field.value = interaction.options.getString("reason", true);
            isInvalidated = true;
          }
        })

        if (!isInvalidated) return interaction.reply({ content: `The message needs to be first invalidated using the ${parseId(ids.invalid)} button!`, ephemeral: true })

        message.edit({ embeds: [embed], files: [...message.attachments.values()] });
        interaction.reply({ content: await interaction.text({ string: "Success.General" }), ephemeral: true });
      })
      .catch(err => {
        interaction.reply({ content: "Cannot fetch the message with the given message ID", ephemeral: true });
      })
  }
}