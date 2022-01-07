import { SlashCommand } from "~/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import MessageEmbed from '~/Client/embed';
import Client from '~/Client';

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Gets latency.")
  ,
  execute: async (interaction: CommandInteraction, client: Client) => {
    let embed = new MessageEmbed().setTitle('Pinging...');
    await interaction.reply({ embeds: [embed], ephemeral: true })
      .then(() => {
        const d: Date = new Date()

        embed
          .setTitle('Pong!')
          // Bot latency broken with command suggestions, solution needed without using message.createdTimestamp
          // May not be up to date as of the typescript rewrite
          .setDescription(
            `_${quotes[Math.floor(Math.random() * quotes.length)]}_\n\n**Bot Latency** \n${d.getTime() - interaction.createdTimestamp}ms \n**API Latency** \n${Math.round(
              client.ws.ping,
            )}ms`,
          );

        try { interaction.editReply({ embeds: [embed] }) } catch (err) { console.error(err); }
      })
  }
}

const quotes = [
  'Feeling cute, might delete later',
  'Sentient',
  'https://youtu.be/dQw4w9WgXcQ',
  `Will become real in ${new Date().getFullYear() + 2}`, // takes the current year and adds 2 for extra confusion
  'I know what you did on January 23rd 2018 at 2:33 am',
  '<@865560086952280084> my beloved',
  'I am 100 meters from your location and rapidly approaching. Start running...',
  '<@468582311370162176> has your IP address',
  'Open your mind. ~Mr. Valve',
  'Open your eyes. ~Mr. Valve',
  "Yeah it's sour cream mmm I love drinking sour cream out of a bowl",
  '*elevator music*',
  'Long-range nuclear missiles engaged and inbound to your location. Brace for impact in approximately `5` minutes.',
  'Have I been that much of a burden?',
  'STAHP',
  'Rise and shine… bot, rise and shine',
  'Networking the circuit…\nBypassing the back-end XML transistor…\nEncoding the DHCP pixel…',
  '*Windows XP start-up jingle*',
  'Do not look behind you',
  '9+10=',
  'Does anybody even read these?',
  'Rule of thumb: Blame Discord API.',
  '<#852223879535657010> my beloved',
  "Here's your ping. Now let me go back to sleep.",
];