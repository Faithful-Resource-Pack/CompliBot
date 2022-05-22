import { SlashCommand, SlashCommandI } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Collection } from 'discord.js';
import { Client, CommandInteraction } from '@client';
import setData from '@functions/setDataToJSON';
import path from 'path';
import axios from 'axios';
import setDeep from '@functions/setDeep';
import getData from '@functions/getDataFromJSON';
import updateTodo from '@functions/updateTodo';

function isEmpty(object: object): boolean {
  return Object.keys(object).length === 0;
}

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('todo')
    .setDescription('Audit the todo list')
    // todo: fully implement remove sub command below
    // .addSubcommand((subcommand) =>
    //   subcommand
    //     .setName("remove")
    //     .setDescription("Remove a texture from the todo list.")
    //     .addIntegerOption((option) =>
    //       option
    //         .setName("textureid")
    //         .setMinValue(1)
    //         .setDescription("Texture ID of the texture to remove")
    //         .setRequired(true),
    //     ),
    // )
    .addSubcommand((subcommand) => subcommand
      .setName('add')
      .setDescription('Add a texture to the todo list.')
      .addStringOption((option) => option.setRequired(true).setName('category').setDescription('Category to append the parent to').addChoices(
        {
          name: 'entity',
          value: 'entity',
        },
        {
          name: 'block',
          value: 'block',
        },
        {
          name: 'item',
          value: 'item',
        },
        {
          name: 'misc',
          value: 'misc',
        },
      ))
      .addIntegerOption((option) => option
        .setName('textureid')
        .setMinValue(1)
        .setDescription('Texture ID of the texture to add')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('parent')
        .setDescription('Create a parent to attach it to or append to an existing one')
        .setRequired(false))
      .addStringOption((option) => option.setName('reason').setDescription('What is wrong with the texture').setRequired(false))),
  execute: new Collection<string, SlashCommandI>()
    .set('add', async (interaction: CommandInteraction, client: Client) => {
      if (
        await interaction.perms({
          type: 'council',
        })
      ) return;

      const todoJson = getData({
        filename: 'todo.json',
        relative_path: path.join(`${__dirname}../../../../json/`),
        default_value: '{}',
      });

      const category = interaction.options.getString('category');
      const textureid = interaction.options.getInteger('textureid').toString();
      const reason = interaction.options.getString('reason');
      const parentName = interaction.options.getString('parent');

      const { data } = await axios.get(`https://api.faithfulpack.net/v2/textures/${textureid}`);

      // edge cases
      if (data.name === undefined && data.status === 404) {
        interaction.reply({
          content: 'A texture with that id does not exist!',
          ephemeral: true,
        });
        return;
      }
      if (data === undefined) {
        interaction.reply({
          content: 'The api is currently down!',
          ephemeral: true,
        });
        return;
      }

      if (!reason && !parentName) {
        interaction.reply({
          content: 'No reason was provided! This is required for textures that dont belong to a parent.',
          ephemeral: true,
        });
        return;
      }

      if (parentName === undefined) {
        // orphan lol
        setDeep(todoJson, [interaction.guildId, category, textureid], reason);
        todoJson[interaction.guildId][category][textureid] = reason;
      } else {
        // used to boar the path; if reason is undefined it will be set to an empty object
        setDeep(todoJson, [interaction.guildId, category, parentName, 'reason'], reason);

        // test if the reason wasnt provided and reason key is equal to an empty object
        // (meaning it wasnt already defined and this is a new parent)
        if (reason === undefined && isEmpty(todoJson[interaction.guildId][category][parentName].reason)) {
          interaction.reply({
            content: `There is no parent in "${category}" with the name ${parentName}. Please provide a reason when creating a parent`,
            ephemeral: true,
          });
          return;
        }

        todoJson[interaction.guildId][category][parentName].reason = reason;

        if (todoJson[interaction.guildId][category][parentName].children === undefined) {
          todoJson[interaction.guildId][category][parentName].children = [];
        }

        todoJson[interaction.guildId][category][parentName].children.push(textureid);
      }
      setData({
        data: todoJson,
        filename: 'todo.json',
        relative_path: path.join(`${__dirname}../../../../json/`),
      });

      interaction.reply({
        content: 'Updating...',
        ephemeral: true,
      });
      await updateTodo(interaction.guildId, client, todoJson, interaction);
      interaction.editReply({
        content: 'Done!',
      });
    })

    .set('remove', async (interaction: CommandInteraction, client: Client) => {
      if (
        await interaction.perms({
          type: 'council',
        })
      ) return;

      const todoJson = getData({
        filename: 'todo.json',
        relative_path: path.join(`${__dirname}../../../../json/`),
        default_value: '{}',
      });

      // TODO: remove id from todoJson
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const id = interaction.options.getInteger('textureID');

      updateTodo(interaction.guildId, client, todoJson, interaction);
    }),
};

export default command;
