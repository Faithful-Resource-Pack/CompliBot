import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getTexture } from "@src/Functions/getTexture";


export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("texture")
    .setDescription("Displays a specified texture from either vanilla Minecraft or Compliance.")
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Name of the texture you are searching for.')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('resolution')
        .setDescription('Resolution of the texture you are searching for.')
        .addChoices([['16x', 16], ['32x', 32], ['64x', 64]])
        .setRequired(true)
    )
  ,
  execute: async (interaction: CommandInteraction) => {
    await interaction.deferReply();
    const firestorm = await import("../../Firestorm");

    const name = interaction.options.getString('name')
    let results = []

    if (name.startsWith('_')) {
      try { results = await firestorm.textures.search([{ field: 'name', criteria: 'includes', value: name }]) }
      catch (err) { console.error(err) }
    }

    else if (name.startsWith('/') || name.endsWith('/')) {
      try { results = await firestorm.paths.search([{ field: 'path', criteria: 'includes', value: name }]) }
      catch (err) { console.error(err) }
    }

    else {
      try { results = await firestorm.textures.search([{ field: 'name', criteria: '==', value: name }]) }
      catch (err) { console.error(err) }

      if (results.length === 0) {
        try { results = await firestorm.textures.search([{ field: 'name', criteria: 'includes', value: name }]) }
        catch (err) { console.error(err) }
      }
    }


    if (results.length == 1) {
      interaction.editReply({ embeds: [await getTexture(results[0], interaction.options.getInteger('resolution', true))] })
    }

    // todo: implements a select menu when there is multiple results
    else if (results.length > 1) {
      interaction.editReply({ content: 'I have not coded this part yet.' })
    }

    else {
      interaction.editReply({ content: 'No results for this texture name: ' + interaction.options.getString('name', true) })
    }

  }
}