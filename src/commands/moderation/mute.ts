import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction, Guild, GuildMember, Interaction, TextChannel, User } from "discord.js";
import { Client, Message, MessageEmbed } from "@client";
import { Config } from "@interfaces";
import ConfigJson from "@json/config.json";
import { parseDate } from "@helpers/dates";
import { colors } from "@helpers/colors";
const config: Config = ConfigJson;

export const command: SlashCommand = {
  permissions: {
    roles: Object.values(config.roles.moderators)
  },
  data: new SlashCommandBuilder()
    .setDefaultPermission(false)
    .setName("mute")
    .setDescription("Mute someone who deserves it. Unmute innocents with a timeout value of 0!")
    .addMentionableOption((option) => option.setName("user").setDescription("User you want to mute").setRequired(true))
    .addStringOption((option) => option.setName("timeout").setDescription("How long do you want it to be muted? (Max: 27 days)").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("The reason behind the mute"))
  ,
  execute: async (interaction: CommandInteraction, client: Client) => {
    const timeout: number = parseDate(interaction.options.getString("timeout", true));
    const reason: string = interaction.options.getString("reason");
    let user: GuildMember = interaction.options.getMentionable("user", true) as any;

    if (!(user instanceof GuildMember)) return interaction.reply({
      content: "The mention should be a user from the server!",
      ephemeral: true
    })

    // check for teams guilds & apply the mute to all teamed guilds
    // if there is no "team", only apply to the guild were the command is made
    let guildsToMute: Array<string> = [];
    const team: string = (interaction.client as Client).config.discords.filter((d) => d.id === interaction.guildId)[0].team;
    
    if (team) guildsToMute = (interaction.client as Client).config.discords.filter((d) => d.team === team).map(d => d.id);
    else guildsToMute = [(interaction.client as Client).config.discords.filter((d) => d.id === interaction.guildId)[0].id];

    // test if user can be timed out (check for permissions)
    try {
      await user.timeout(null);
    } catch (err) {
      return await interaction.reply({ content: `An error occured:\n> Can't mute people above the bot!\n\`\`\`${err}\`\`\``, ephemeral: true });
    }

    guildsToMute.forEach(async (guildId: string) => {
      let guild: Guild;
      let member: GuildMember;

      try {
        guild = await interaction.client.guilds.fetch(guildId);
        member = await guild.members.fetch(user.id);
      } catch { return; }

      // maximum timeout is 27 days (discord limitation)
      await member.timeout((timeout > 2332800 ? 2332800 : timeout) * 1000, reason);
    })

    const embed: MessageEmbed = new MessageEmbed()
      .setTitle(`${user.displayName} has been ${timeout > 0 ? "muted" : "unmuted"}.`)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) })
      .setColor(colors.black)
      .addFields([
        { name: "User", value: `<@!${user.id}>` },
        { name: "Reason", value: reason ? reason : "No reason given.", inline: true },
      ])
    
    if (timeout > 0)
      embed.addFields([
        { name: "Timeout", value: `<t:${(new Date().getTime()/1000 + timeout).toFixed(0)}:R>`, inline: true},
      ]);

    const message: Message = await interaction.reply({ embeds: [embed], fetchReply: true }) as any;

    // construct logs
    // todo: add mute icon in thumbnail (waiting for Pomi to draw it)
    const logEmbed: MessageEmbed = new MessageEmbed()
      .setTitle(`${timeout > 0 ? "Muted" : "Unmuted"} someone`)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) })
      .setColor(colors.red)
      .addFields([
        { name: "Server", value: `\`${interaction.guild.name}\``, inline: true},
        { name: "Channel", value: `${interaction.channel}`, inline: true},
        { name: "Message", value: `[Jump to it](${message.url})`, inline: true },
        { name: "User", value: `<@!${user.id}>`, inline: true },
        { name: "Reason", value: reason ? reason : "No reason given.", inline: true },
      ])
      .setTimestamp();

    if (timeout > 0)
      logEmbed.addFields([
        { name: "Timeout", value: `<t:${(new Date().getTime()/1000 + timeout).toFixed(0)}:R>`, inline: true},
      ]);

    // send log into the addressed logs channel
    let logChannel: TextChannel;
    try {
      if (team) logChannel = await interaction.client.channels.fetch((interaction.client as Client).config.teams.filter(t => t.name === team)[0].channels.moderation) as any;
      else logChannel = await interaction.client.channels.fetch((interaction.client as Client).config.discords.filter(d => d.id === interaction.guildId)[0].channels.moderation) as any;
      logChannel.send({ embeds: [logEmbed] });
    } catch { return } // can't fetch log channel;

  }
}