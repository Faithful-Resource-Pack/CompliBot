import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, AttachmentBuilder } from "discord.js";
import { Message, Client } from "@client";

/**
 * Warning: key value cannot be longer than a certain value (I didn't search how much it is)
 * :: values used in SlashCommandBuilder must be defined before the bot construct it
 *
 * ! extension needs to be provided
 * !! .webp extension aren't rendering inside Discord
 */
const options: { name: string; value: string }[] = [
	{
		name: "pizza",
		value: "https://i0.wp.com/metro.co.uk/wp-content/uploads/2016/02/pizza-cheese.gif",
	},
	{ name: "soup", value: "https://c.tenor.com/45SSoTETymIAAAAS/sopita-de-fideo-noodle.gif" },
	{ name: "burger", value: "https://c.tenor.com/tdFqDJemKpUAAAAC/mcdonalds-big-mac.gif" },
	{ name: "poop", value: "https://media.tenor.com/QA6mPKs100UAAAAC/caught-in.gif" },
	{
		name: "66",
		value: "https://media1.tenor.com/images/fb7250a2ef993a37e9c7f48af760821c/tenor.gif",
	},
	{ name: "help", value: "https://c.tenor.com/yi5btxWVAwwAAAAS/help-shouting.gif" },
	{ name: "ice", value: "https://c.tenor.com/ySPd8qwdV7QAAAAC/frozen-ice.gif" },
	{ name: "fire", value: "https://i.giphy.com/media/Qre4feuyNhiYIzD7hC/200.gif" },
	{ name: "popcorn", value: "https://c.tenor.com/yinQBUPPd_IAAAAC/michael-jackson-popcorn.gif" },
];

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("order")
		.setDescription("Get something special")
		.addStringOption((option) =>
			option
				.setName("item")
				.setDescription("The item you want.")
				.addChoices(...options)
				.setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		let advice: string = null;

		// send an annotation following the gif
		for (const option of options) {
			if (option[1] === interaction.options.getString("item")) {
				switch (option[0]) {
					case "soup":
						advice = "Gutten Appetit";
						break;
					case "pizza":
						advice = "Buon Appetito!";
						break;
					case "poop":
						advice = ":eyes:";
						break;
					default:
						break;
				}
			}
		}

		const gif = new AttachmentBuilder(interaction.options.getString("item"), {
			name: interaction.options.getString("item"),
		});
		interaction
			.editReply({ content: advice, files: [gif] })
			.then((message: Message) => message.deleteButton());
	},
};
