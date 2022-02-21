import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Message, MessageEmbed } from "@src/Extended Discord";
import { EmbedField, GuildMember, Role } from "discord.js";
import { ids, parseId } from "@helpers/emojis";


export const command: SlashCommand = {
  permissions: undefined,
  data: new SlashCommandBuilder()
    .setName("invalidate")
    .setDescription("Set reason for submission invalidation!")
    .addStringOption(option => 
      option
        .setName("message_id")
        .setDescription("Submission you want to add a reason.")
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName("reason")
        .setDescription("Reason of the invalidation.")
        .setRequired(true)
    )
    ,
  execute: async (interaction: CommandInteraction) => {
    const member: GuildMember = interaction.member as GuildMember;
    let isInvalidated: boolean = false;

    // check if member is council
    if (member.roles.cache.find((role: Role) => Object.values((interaction.client as Client).config.roles.council).includes(role.id)) === undefined) 
      return interaction.reply({
        content: await interaction.text({ string: "Error.NoPermissions" }),
        ephemeral: true
      })


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