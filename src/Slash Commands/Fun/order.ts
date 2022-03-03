import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageAttachment } from "discord.js";
import { Message, Client } from "@src/Extended Discord";

/**
 * Warning: key value cannot be longer than a certain value (I didn't search how much it is)
 * :: values used in SlashCommandBuilder must be defined before the bot construct it
 *
 * ! extension needs to be provided
 * !! .webp extension aren't rendering inside Discord
 */
const options: [name: string, value: string][] = [
	["pizza", "https://i0.wp.com/metro.co.uk/wp-content/uploads/2016/02/pizza-cheese.gif"],
	["soup", "https://c.tenor.com/45SSoTETymIAAAAS/sopita-de-fideo-noodle.gif"],
	["burger", "https://c.tenor.com/tdFqDJemKpUAAAAC/mcdonalds-big-mac.gif"],
	["poop", "https://c.tenor.com/-Rv2hPlRKA0AAAAC/i-see-what-you-did-there-steve-carell.gif"],
	["66", "https://media1.tenor.com/images/fb7250a2ef993a37e9c7f48af760821c/tenor.gif"],
	["help", "https://c.tenor.com/yi5btxWVAwwAAAAS/help-shouting.gif"],
	["ice", "https://c.tenor.com/ySPd8qwdV7QAAAAC/frozen-ice.gif"],
	["fire", "https://i.giphy.com/media/Qre4feuyNhiYIzD7hC/200.gif"],
	["popcorn", "https://c.tenor.com/yinQBUPPd_IAAAAC/michael-jackson-popcorn.gif"],
];

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("order")
		.setDescription("Get something special")
		.addStringOption((option) =>
			option.setName("item").setDescription("The item you want!").addChoices(options).setRequired(true),
		),
	execute: async (interaction: CommandInteraction, client: Client) => {
		await interaction.deferReply();
		let advice: string = null;

		// send an anotation following the gif
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

		const gif: MessageAttachment = new MessageAttachment(
			interaction.options.getString("item"),
			interaction.options.getString("item"),
		);
		interaction.editReply({ content: advice, files: [gif] }).then((message: Message) => message.deleteButton());
	},
};
