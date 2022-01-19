import MessageEmbed from '@src/Client/embed';
import axios from 'axios';
import Client from '@src/Client';

import { Collection, CommandInteraction, MessageAttachment, WebhookEditMessageOptions } from 'discord.js';
import { SlashCommand, SlashCommandI } from '@src/Interfaces/slashCommand';
import { SlashCommandBuilder } from "@discordjs/builders";
import { ColorManager } from '@src/Functions/canvas/colors';


export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("color")
		.setDescription("Use this commands to gets information about a color.")
		.addSubcommand((subcommand) =>
			subcommand.setName("hex")
				.setDescription("Get information about an hex color!")
				.addStringOption(option =>
					option.setName("value")
						.setDescription("Hexadecimal value.")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("rgb-a")
				.setDescription("Get information about an hex color!")
				.addNumberOption(option =>
					option.setName("red")
						.setDescription("red value.")
						.setRequired(true)
				)
				.addNumberOption(option =>
					option.setName("green")
						.setDescription("green value.")
						.setRequired(true)
				)
				.addNumberOption(option =>
					option.setName("blue")
						.setDescription("blue value.")
						.setRequired(true)
				)
				.addNumberOption(option =>
					option.setName("alpha")
						.setDescription("alpha value.")
				)
		)
	,
	execute: new Collection<string, SlashCommandI>()
		.set("hex", async (interaction: CommandInteraction, client: Client) => {

			const c = new ColorManager({ hex: interaction.options.getString('value') });
			try { interaction.reply(await constructResponse(client, c)); } catch (_err) { console.error(_err); };
		})
		.set("rgb-a", async (interaction: CommandInteraction, client: Client) => {

			const c = new ColorManager({ rgb: [interaction.options.getNumber('red', true), interaction.options.getNumber('green', true), interaction.options.getNumber('blue', true), interaction.options.getNumber('alpha', false)] });
			interaction.reply(await constructResponse(client, c));
		})
}

async function constructResponse(client: Client, color: ColorManager): Promise<WebhookEditMessageOptions> {
	const name = await axios.get(`https://www.thecolorapi.com/id?format=json&hex=${color.toHEX().value}`)
		.then(res => res.data.name.value)
		.catch(_err => { return 'unknown (an error occured).' })

	const embed = new MessageEmbed()
		.setColor(`#${color.toHEX().value}`)
		.setThumbnail(`attachment://color.png`)
		.setTitle('Color Preview')
		.setURL(`https://coolors.co/${color.toHEX().value}`)

	const options = {
		url: `${client.config.images}monochrome_logo.png`,
		color: color.toRGBA(),
		target: { r: 255, g: 255, b: 255, a: 1 }
	};
	const thumbnail = new MessageAttachment(await color.swapPixel(options), `color.png`);

	embed.addFields(
		{ name: 'HEXa', value: `#${color.toHEXA().value}`, inline: true },
		{ name: 'RGBa', value: `rgba(${Object.values(color.toRGBA()).join(', ')})`, inline: true },
		{ name: 'HSL', value: 'soon', inline: true },
		{ name: 'HSV', value: 'soon', inline: true },
		{ name: 'CMYK', value: 'soon', inline: true },
		{ name: 'Color Name', value: name }
	)

	return { embeds: [embed], files: [thumbnail] };
}