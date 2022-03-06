import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction, TextChannel } from "discord.js";
import { Client, Message, MessageEmbed } from "@client";
import { Config } from "@interfaces";
import ConfigJson from "@json/config.json";
import { colors } from "@helpers/colors";
const config: Config = ConfigJson;

export const command: SlashCommand = {
  permissions: {
    roles: Object.values(config.roles.moderators)
  },
  data: new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("clear")
    .setDescription("Clear the asked amount of message")
    .addNumberOption((option) => 
      option
        .setName("amount")
        .setDescription("The amount of message you want to clear [0 - 100]")
        .setRequired(true)
    )
  ,
  execute: async (interaction: CommandInteraction, client: Client) => {
    const amount: number = interaction.options.getNumber("amount", true);
    if (amount > 100 || amount < 0) return interaction.reply({ ephemeral: true, content: "Amount must be between `0` and `100`" });

    let messages: Collection<string, Message>;
    try {
      messages = await interaction.channel.messages.fetch({ limit: amount });
      await (interaction.channel as TextChannel).bulkDelete(messages);
    } catch (err) { return interaction.reply({ content: err, ephemeral: true }); }

    interaction.reply({ ephemeral: true, content: `Succesfully deleted ${amount} messages` });

    const embed: MessageEmbed = new MessageEmbed()
      .setTitle(`Deleted ${amount} message${amount === 1 ? "": "s"}`)
      .setAuthor({ name: interaction.user.username })
      .setColor(colors.red)
      .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
      .addFields([
        { name: "Server", value: `\`${interaction.guild.name}\``, inline: true },
        { name: "Channel", value: `${interaction.channel}`, inline: true },
      ])
      .setTimestamp();

    try {
      client.channels.fetch(config.discords.filter(d => d.id === interaction.guildId)[0].channels.moderation)
        .then((channel: TextChannel) => channel.send({ embeds: [embed] }));
    } catch { return; } // can't fetch channel
  }
}