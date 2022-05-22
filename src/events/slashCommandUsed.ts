import { SlashCommandI, Event } from '@interfaces';
import { Collection } from 'discord.js';
import { Client, CommandInteraction } from '@client';

const event: Event = {
  name: 'slashCommandUsed',
  run: async (client: Client, interaction: CommandInteraction): Promise<void> => {
    client.storeAction('slashCommand', interaction);

    // get command name
    const { commandName } = interaction;

    // test if client has this command registered
    if (!client.slashCommands.has(commandName)) return Promise.reject(new Error(`Command ${commandName} not found`));

    // get this command
    const command = client.slashCommands.get(commandName);

    try {
      // try if there is a subcommand
      interaction.options.getSubcommand();
      // execute it if so
      (command.execute as Collection<string, SlashCommandI>).get(interaction.options.getSubcommand())(
        interaction,
        client,
      );
    } catch (_err) {
      // not a subcommand
      try {
        // execute command
        (command.execute as SlashCommandI)(interaction as CommandInteraction, client);
      } catch (err) {
        console.error(err);
        return interaction.reply({
          content: 'There were an error with command!',
          ephemeral: true,
        });
      }
    }

    // increase uses of that command
    const count: number = client.commandsProcessed.get((command.data as SlashCommandI).name) + 1;
    client.commandsProcessed.set((command.data as SlashCommandI).name, Number.isNaN(count) ? 1 : count);

    return Promise.resolve();
  },
};

export default event;
