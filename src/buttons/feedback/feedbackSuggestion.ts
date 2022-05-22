import {
  Client, MessageEmbed, Message, ButtonInteraction,
} from '@client';
import { Button } from '@interfaces';
import { MessageInteraction } from 'discord.js';

const Suggestion = [
  'Hot take but okay',
  'Sure...',
  'Maybe later...',
  "Why didn't i think of that?",
  'Adding one to the other %NUMBER% things todo',
  'Infeasible idea but tell them you might',
  'Dev bad',
  'soon:tm:',
];

const button: Button = {
  buttonId: 'feedbackSuggestion',
  execute: async (client: Client, interaction: ButtonInteraction) => {
    const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
    const message: Message = interaction.message as Message;

    if (interaction.user.id !== messageInteraction.user.id) {
      interaction.reply({
        content: (
          await interaction.getEphemeralString({
            string: 'Error.Interaction.Reserved',
          })
        ).replace('%USER%', `<@!${messageInteraction.user.id}>`),
        ephemeral: true,
      });
      return;
    }

    const channelFeedback = client.channels.cache.get(
      client.config.discords.filter((d) => d.name === 'dev')[0].channels[interaction.customId],
    );

    if (!channelFeedback) {
      interaction.reply({
        content: (
          await interaction.getEphemeralString({
            string: 'Error.Channel.CacheNotFound',
          })
        ).replace('%CHANNEL_NAME%', '#feedback'),
        ephemeral: true,
      });
      return;
    }

    if (!channelFeedback.isText()) {
      interaction.reply({
        content: await interaction.getEphemeralString({
          string: 'Error.Channel.NotTextChannel',
        }),
        ephemeral: true,
      });
      return;
    }

    const embedResponse = new MessageEmbed()
      .setTitle(
        await interaction.getEphemeralString({
          string: 'Command.Feedback.Sent',
        }),
      )
      .setDescription(await message.embeds[0].description)
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.avatarURL(),
      })
      .setTimestamp();

    const reply: Message = (await interaction.reply({
      embeds: [embedResponse],
      fetchReply: true,
    })) as Message;
    const { url } = reply;
    const quote: string = Suggestion[Math.floor(Math.random() * Suggestion.length)].replace(
      '%NUMBER%',
      new Date().getTime().toString(),
    );

    const embedFeedback = new MessageEmbed()
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.avatarURL(),
      })
      .setTitle('[SUGGESTION] Feedback')
      .setDescription(`${`[Jump to message](${url})\n\`\`\``}${message.embeds[0].description}\`\`\`\n_${quote}_`)
      .setFooter({
        text: `${interaction.guild.name}`,
      })
      .setTimestamp();

    channelFeedback.send({
      embeds: [embedFeedback],
    });

    try {
      message.delete();
    } catch (_err) {
      /* message already deleted */
    }
  },
};

export default button;
