import { buttonDelete } from '@buttons';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  Message,
} from 'discord.js';

declare module 'discord.js' {
  interface ChatInputCommandInteraction {
    /**
     * Add a delete button to the interaction response.
     */
    replyDeletable(options: InteractionReplyOptions & { fetchReply: true }): Promise<Message<BooleanCache<CacheType>>>;
    replyDeletable(options: string | MessagePayload | InteractionReplyOptions): Promise<InteractionResponse<BooleanCache<CacheType>>>;
    replyDeletable(options: any): Promise<any>;

    followUpDeletable(options: InteractionReplyOptions): Promise<Message>;
  }
}

function addButtonComponent(options: InteractionReplyOptions, buttonComponent: ButtonBuilder): void {
  if (options.ephemeral === true) return; // don't add the button if the message is ephemeral

  if (options.components !== undefined) {
    if (options.components.length < 5) options.components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(buttonDelete));
    else throw new Error('Cannot add more than 5 actions rows to an interaction');
  } else {
    options.components = [new ActionRowBuilder<ButtonBuilder>().addComponents(buttonComponent)];
  }
}

Object.defineProperty(ChatInputCommandInteraction.prototype, 'replyDeletable', {
  async value(options: InteractionReplyOptions) {
    addButtonComponent(options, buttonDelete);
    return this.reply(options);
  },
  enumerable: false,
  configurable: false,
  writable: false,
});

Object.defineProperty(ChatInputCommandInteraction.prototype, 'followUpDeletable', {
  async value(options: InteractionReplyOptions): Promise<Message> {
    addButtonComponent(options, buttonDelete);
    return this.followUp(options);
  },
  enumerable: false,
  configurable: false,
  writable: false,
});

export { ChatInputCommandInteraction };
