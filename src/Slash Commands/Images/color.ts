import MessageEmbed from "@src/Client/embed";
import axios from "axios";
import Client from "@src/Client";
import Message from "@src/Client/message";
import { Collection, CommandInteraction, MessageAttachment, WebhookEditMessageOptions } from "discord.js";
import { SlashCommand, SlashCommandI } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ColorManager } from "@src/Functions/canvas/colors";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("color")
		.setDescription("Use this commands to gets information about a color.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("hex")
				.setDescription("Get information about a HEX color!")
				.addStringOption((option) => option.setName("value").setDescription("Hexadecimal value.").setRequired(true)),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("rgb-a")
				.setDescription("Get information about a RGBa color!")
				.addNumberOption((option) => option.setName("red").setDescription("red value.").setRequired(true))
				.addNumberOption((option) => option.setName("green").setDescription("green value.").setRequired(true))
				.addNumberOption((option) => option.setName("blue").setDescription("blue value.").setRequired(true))
				.addNumberOption((option) => option.setName("alpha").setDescription("alpha value.")),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("hsl")
				.setDescription("Get information about a HSL color!")
				.addNumberOption((option) => option.setName("hue").setDescription("hue value.").setRequired(true))
				.addNumberOption((option) => option.setName("saturation").setDescription("saturation value.").setRequired(true))
				.addNumberOption((option) =>
					option.setName("lightness").setDescription("lightness/brightness value.").setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("hsv")
				.setDescription("Get information about a HSV color!")
				.addNumberOption((option) => option.setName("hue").setDescription("hue value.").setRequired(true))
				.addNumberOption((option) => option.setName("saturation").setDescription("saturation value.").setRequired(true))
				.addNumberOption((option) => option.setName("value").setDescription("color value.").setRequired(true)),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("cmyk")
				.setDescription("Get information about a CMYK color!")
				.addNumberOption((option) => option.setName("cyan").setDescription("cyan color.").setRequired(true))
				.addNumberOption((option) => option.setName("magenta").setDescription("magenta color.").setRequired(true))
				.addNumberOption((option) => option.setName("yellow").setDescription("yellow color.").setRequired(true))
				.addNumberOption((option) => option.setName("key").setDescription("black key color.").setRequired(true)),
		),
	execute: new Collection<string, SlashCommandI>()
		.set("hex", async (interaction: CommandInteraction, client: Client) => {
			// todo : add value verification

			const c = new ColorManager({ hex: interaction.options.getString("value") });
			await interaction.reply(await constructResponse(client, c));
			const message: Message = (await interaction.fetchReply()) as Message;
			message.deleteReact({ authorMessage: message, authorID: interaction.user.id, deleteAuthorMessage: false });
		})
		.set("rgb-a", async (interaction: CommandInteraction, client: Client) => {
			// todo : add value verification

			const c = new ColorManager({
				rgb: {
					r: interaction.options.getNumber("red", true),
					g: interaction.options.getNumber("green", true),
					b: interaction.options.getNumber("blue", true),
					a: interaction.options.getNumber("alpha", false),
				},
			});
			await interaction.reply(await constructResponse(client, c));
			const message: Message = (await interaction.fetchReply()) as Message;
			message.deleteReact({ authorMessage: message, authorID: interaction.user.id, deleteAuthorMessage: false });
		})
		.set("hsl", async (interaction: CommandInteraction, client: Client) => {
			// todo : add value verification

			const c = new ColorManager({
				hsl: {
					h: interaction.options.getNumber("hue", true),
					s: interaction.options.getNumber("saturation", true),
					l: interaction.options.getNumber("lightness", true),
				},
			});
			await interaction.reply(await constructResponse(client, c));
			const message: Message = (await interaction.fetchReply()) as Message;
			message.deleteReact({ authorMessage: message, authorID: interaction.user.id, deleteAuthorMessage: false });
		})
		.set("hsv", async (interaction: CommandInteraction, client: Client) => {
			// todo : add value verification

			const c = new ColorManager({
				hsv: {
					h: interaction.options.getNumber("hue", true),
					s: interaction.options.getNumber("saturation", true),
					v: interaction.options.getNumber("value", true),
				},
			});
			await interaction.reply(await constructResponse(client, c));
			const message: Message = (await interaction.fetchReply()) as Message;
			message.deleteReact({ authorMessage: message, authorID: interaction.user.id, deleteAuthorMessage: false });
		})
		.set("cmyk", async (interaction: CommandInteraction, client: Client) => {
			// todo : add value verification

			const c = new ColorManager({
				cmyk: {
					c: interaction.options.getNumber("cyan", true),
					m: interaction.options.getNumber("magenta", true),
					y: interaction.options.getNumber("yellow", true),
					k: interaction.options.getNumber("key", true),
				},
			});
			await interaction.reply(await constructResponse(client, c));
			const message: Message = (await interaction.fetchReply()) as Message;
			message.deleteReact({ authorMessage: message, authorID: interaction.user.id, deleteAuthorMessage: false });
		}),
};

async function constructResponse(client: Client, color: ColorManager): Promise<WebhookEditMessageOptions> {
	const name = await axios
		.get(`https://www.thecolorapi.com/id?format=json&hex=${color.toHEX().value}`)
		.then((res) => res.data.name.value)
		.catch((_err) => {
			return "unknown (an error occured).";
		});

	const embed = new MessageEmbed()
		.setColor(`#${color.toHEX().value}`)
		.setThumbnail(`attachment://color.png`)
		.setTitle("Color Preview")
		.setURL(`https://coolors.co/${color.toHEX().value}`);

	const options = {
		url: `${client.config.images}monochrome_logo.png`,
		color: color.toRGBA(),
		target: { r: 255, g: 255, b: 255, a: 1 },
	};
	const thumbnail = new MessageAttachment(await color.swapPixel(options), `color.png`);

	embed.addFields(
		{ name: "Color Name", value: `\`${name}\`` },
		{ name: "HEXa", value: `\`#${color.toHEXA().value}\``, inline: true },
		{ name: "RGBa", value: `\`rgba(${Object.values(color.toRGBA()).join(", ")})\``, inline: true },
		{ name: "HSL", value: `\`hsl(${Object.values(color.toHSL()).join(", ")})\``, inline: true },
		{ name: "HSV", value: `\`hsv(${Object.values(color.toHSV()).join(", ")})\``, inline: true },
		{ name: "CMYK", value: `\`cmyk(${Object.values(color.toCMYK()).join(", ")})\``, inline: true },
	);

	return { embeds: [embed], files: [thumbnail] };
}
