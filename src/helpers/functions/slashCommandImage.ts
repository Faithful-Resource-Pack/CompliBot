import { CommandInteraction, Message, MessageEmbed } from '@client';
import { imageButtons } from '@helpers/buttons';
import { Collection, MessageAttachment, User } from 'discord.js';

/**
 * STEPS:
 *  1. Check if there is a message with an image in last X messages
 *  2. Apply the given function on that image
 *  3. Construct result embed with result image
 */

/**
 * Check if the message has a image attached somewhere
 * @param message Discord.Message
 * @returns image URL
 */
export async function getImageFromMessage(message: Message): Promise<string> {
  // if image is attached
  if (message.attachments.size > 0 && message.attachments.first().url.match(/\.(jpeg|jpg|png)$/)) return message.attachments.first().url;
  // else if the message is an embed
  if (message.embeds[0]) {
    // else if the embed has a thumbnail field
    if (message.embeds[0].thumbnail) return message.embeds[0].thumbnail.url;
    // if the embeds has an image field
    if (message.embeds[0].image) return message.embeds[0].image.url;
  }

  // if no images attached to the first parent reply, check if there is another parent reply (recursive go brr)
  if (message.type === 'REPLY') {
    try {
      await message.fetchReference();
    } catch {
      return null;
    }

    return getImageFromMessage(await message.fetchReference());
  }

  return null; // default value
}

/**
 * Check if there is a message with a message within the `limit` of messages in the `channel`
 * Do a await message if the userInteraction.doInteraction is set to true
 * @param interaction {TextChannel}
 * @param limit {Number}
 * @param userInteraction.doInteraction {boolean}
 * @param userInteraction.user {User}
 * @param userInteraction.time {Number}
 * @returns {Promise<string>} image url
 */
export async function fetchMessageImage(
  interaction: CommandInteraction,
  limit: number,
  userInteraction: {
    doInteraction: boolean;
    user: User;
    time?: number;
  },
): Promise<string> {
  // fetch X messages
  let messages: Collection<string, Message<boolean>>;
  try {
    messages = await interaction.channel.messages.fetch({
      limit,
    });
  } catch {
    return null;
  } // can't fetch messages

  let message: Message = messages
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
    .filter(
      (m) => (m.attachments.size > 0 && (m.attachments.first().url.match(/\.(jpeg|jpg|png)$/) as any))
        // TODO: definitely not the best way to do this
        || (m.embeds[0] !== undefined
          && ((m.embeds[0].thumbnail !== null && m.embeds[0].thumbnail.url.match(/\.(jpeg|jpg|png)$/))
            || (m.embeds[0].image !== null && m.embeds[0].image.url.match(/\.(jpeg|jpg|png)$/)))),
    )
    .first();

  // no need to await user interaction (a message has been found)
  if (message !== undefined) return getImageFromMessage(message);

  // no message found but we don't ask the user to provide an image
  if (!userInteraction.doInteraction) return null;

  // no message found but we wait for user input
  const embed = new MessageEmbed()
    .setTitle(
      await interaction.getEphemeralString({
        string: 'Command.Images.NotFound.Title',
      }),
    )
    .setDescription(
      await interaction.getEphemeralString({
        string: 'Command.Images.NotFound',
        placeholders: {
          NUMBER: `${limit}`,
        },
      }),
    );

  const embedMessage: Message = (await interaction.editReply({
    embeds: [embed],
  })) as Message;
  const awaitedMessages: Collection<string, Message<boolean>> = await interaction.channel.awaitMessages({
    filter: (m: Message) => m.author.id === userInteraction.user.id,
    max: 1,
    time: 30000, // 30s
  });

  message = awaitedMessages
    .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
    .filter(
      (m) => (m.attachments.size > 0 && (m.attachments.first().url.match(/\.(jpeg|jpg|png)$/) as any))
        || (m.embeds[0] !== undefined && (m.embeds[0].thumbnail !== null || m.embeds[0].image !== null)),
    )
    .first();

  try {
    embedMessage.delete();
  } catch {
    // waiting embed already gone
  }

  if (message !== undefined) return getImageFromMessage(message);
  return null;
}

export type Action = (args: any) => Promise<[MessageAttachment, MessageEmbed]>;
export async function generalSlashCommandImage(
  interaction: CommandInteraction,
  actionCommand: Action,
  actionCommandParams: any,
): Promise<void> {
  await interaction.deferReply();

  const attachmentUrl = interaction.options.getAttachment('image', false)?.url; // safe navigation operator.
  const imageURL: string = attachmentUrl || await fetchMessageImage(interaction, 10, {
    doInteraction: true,
    user: interaction.user,
  });

  if (imageURL === null) {
    await interaction.followUp({
      content: await interaction.getEphemeralString({
        string: 'Command.Images.NoResponse',
      }),
      ephemeral: true,
    });
    return;
  }

  const [attachment, embed]: [MessageAttachment, MessageEmbed] = await actionCommand({
    ...actionCommandParams,
    url: imageURL,
  });

  if (attachment === null) {
    await interaction.followUp({
      content: await interaction.getEphemeralString({
        string: 'Command.Images.TooBig',
      }),
      ephemeral: true,
    });
    return;
  }

  interaction
    .editReply({
      files: [attachment],
      embeds: [embed],
      components: [imageButtons],
    })
    .then((message: Message) => {
      message.deleteButton();
    });
}
