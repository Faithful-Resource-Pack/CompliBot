import { CommandInteraction, ContextMenuInteraction, Emoji, Interaction, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { Command, Event } from '../Interfaces';
import * as emojis from '../Helpers/emojis';

export const event: Event = {
	name: 'interactionCreate',
	run: async (client, interaction: Interaction) => {
		if (interaction.isButton()) {
			switch (interaction.customId) {
				case 'vote-yes-submission':
					break;
				case 'vote-no-submission':
					break;
				case 'more-submission':
					break;
			}
		} else if (interaction.isSelectMenu()) {
			switch (interaction.values[0]) {
				case 'magnify':
					break;
				case 'palette':
					break;
				case 'tile':
					break;
			}
		}
	},
};
