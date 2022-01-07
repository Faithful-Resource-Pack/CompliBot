import { SlashCommand } from "~/Interfaces/slashCommand";
import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import MessageEmbed from '~/Client/embed';
import Client from '~/Client';

export const command: SlashCommand = {
  dev: true,
  data: new SlashCommandBuilder()
    .setName("ball")
    .setDescription("Asks a question to the 8-ball.")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName("question")
        .setDescription("The question to ask to the 8-ball.")
        .setRequired(true)
    )
  ,
  execute: (interaction: CommandInteraction, client: Client) => {

    let embed = new MessageEmbed()
      .setTitle(`${interaction.options.getString("question", true)}`.slice(0, 255))
      .setDescription(answers[Math.floor(Math.random() * answers.length)]);

    interaction.reply({ embeds: [embed] })
  }
}

const answers = [
  'Yes',
  'Yes.',
  'Yes?',
  'Yes!',
  'No',
  'No.',
  'No?',
  'No!',
  'Maybe',
  'Maybe not',
  'Probably',
  'Probably not',
  "I don't know",
  'True',
  'False',
  "I'll think about it",
  'Could you rephrase that',
  "I'm sure of it",
  "I'm not sure",
  'Of course',
  'Of course not',
  'Question too vague',
  'Definitely',
  'Definitely not',
  'Totally not',
  'Totally',
  'It is impossible',
  'It is possible',
  'It is decidedly so',
  'Possibly',
  'Possibly not',
  'Try asking again',
  'Up to you',
  '¯_(ツ)_/¯',
  'Not really',
  'Absolutely',
  'Absolutely not',
  'It is decidedly so',
  'Sure',
  'It is certain',
  'Without a doubt',
  'Yes definitely',
  'You may rely on it',
  'As I see it, yes',
  'Most likely',
  'Outlook good',
  'Signs point to yes',
  'Reply hazy try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  "Don't count on it",
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful',
];