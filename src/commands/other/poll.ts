import { CommandInteraction, EmbedField } from 'discord.js';
import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Poll } from '@class/poll';
import { addSeconds, parseDate } from '@helpers/dates';
import { ids, parseId } from '@helpers/emojis';
import { Client, MessageEmbed } from '@client';

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('You want to ask something?')
    .addStringOption((option) =>
      option.setName('question').setDescription('Write the question here.').setRequired(true),
    )
    .addNumberOption((option) =>
      option.setName('answers').setDescription('How many answers does the poll have? (Max: 5)').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('timeout').setDescription('Timeout for the vote. (schema: 3 min, 10 h, 1 year)').setRequired(true),
    )
    .addBooleanOption((option) => option.setName('anonymous').setDescription('Should votes be anonymous?'))
    .addBooleanOption((option) => option.setName('thread').setDescription('Do you want a thread for this question?'))
    .addBooleanOption((option) =>
      option.setName('allow-multiple-answers').setDescription('When set to true, users can vote for multiple answers.'),
    )
    .addBooleanOption((option) =>
      option
        .setName('yesno')
        .setDescription('Do you want to use the YES/NO format? Will force 2 answers to be provided.'),
    )
    .addStringOption((option) =>
      option.setName('description').setDescription('Add more information about your poll here.'),
    ),
  execute: async (interaction: CommandInteraction, client: Client) => {
    const question: string = interaction.options.getString('question', true);
    const multipleAnswers: boolean =
      interaction.options.getBoolean('allow-multiple-answers', false) === true ? true : false;
    const timeoutVal: string | null = interaction.options.getString('timeout', false);
    const yesno: boolean = interaction.options.getBoolean('yesno', false) === true ? true : false;
    const thread: boolean = interaction.options.getBoolean('thread', false) === true ? true : false;
    const description: string = interaction.options.getString('description', false);
    const anonymous: boolean = interaction.options.getBoolean('anonymous', false) === true ? true : false;

    const _count: number = interaction.options.getNumber('answers', true);
    const answersCount: number = yesno ? 2 : _count > 5 ? 5 : _count < 2 ? 2 : _count;

    // instantiate a new poll
    const poll = new Poll();

    // setup timeout
    if (timeoutVal !== null) {
      if (parseInt(timeoutVal, 10).toString() === timeoutVal)
        return interaction.reply({
          content: await interaction.getEphemeralString({
            string: 'Error.Timeout.NoTypeGiven',
          }),
          ephemeral: true,
        });
      poll.setTimeout(addSeconds(new Date(), parseDate(timeoutVal)));
    } else poll.setTimeout(0);

    /* default embed */
    const embed = new MessageEmbed()
      .setTitle('Poll constructor:')
      .setDescription(`Please send a message below for each ${answersCount} answers:`)
      .setFooter({
        text: 'use /poll to make a poll!',
      });

    interaction.reply({
      embeds: [embed],
    });

    /* watching for message with answers */
    const filter = (m) => m.author.id === interaction.member.user.id;

    let answersArr: Array<string> = [];
    let response: any;
    const yesnoEmojis: Array<string> = [parseId(ids.upvote), parseId(ids.downvote)];
    const numberEmojis: Array<string> = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    embed.addField('Answers', 'None', true);
    do {
      try {
        const collected = await interaction.channel.awaitMessages({
          filter,
          max: 1,
          time: 30000,
          errors: ['time'],
        });
        answersArr.push(collected.first().content);
        try {
          collected.first().delete();
        } catch (_err) {
          /* message can't be deleted */
        }
      } catch (err) {
        answersArr.push(err);
      }

      embed.setDescription(`Waiting for answers... ${answersCount - answersArr.length} left.`);
      embed.setFields(
        embed.fields.map((field: EmbedField) => {
          if (field.name === 'Answers')
            field.value = answersArr
              .map((answer: string, index: number) => `${yesno ? yesnoEmojis[index] : numberEmojis[index]} ${answer}`)
              .join('\n');
          return field;
        }),
      );

      response = await interaction.editReply({
        embeds: [embed],
      });
    } while (answersArr.length < answersCount);

    if (description) embed.setDescription(description);
    else embed.description = null;

    poll.setMultipleAnswers(multipleAnswers);
    poll.setAnonymous(anonymous);
    poll.postSubmissionMessage(interaction, embed, {
      question,
      yesno,
      answersArr,
      thread,
    });
  },
};
