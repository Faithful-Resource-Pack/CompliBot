import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, TextChannel } from "discord.js";
import Message from "@src/Client/message";
import Client from "@src/Client";

/**
 * Warning: key value cannot be longer than a certain value (I didn't search how much it is)
 * :: values used in SlashCommandBuilder must be defined before the bot construct it
 */
const options: [name: string, value: string][] = [
	["pizza", "https://i0.wp.com/metro.co.uk/wp-content/uploads/2016/02/pizza-cheese.gif"],
	["soup", "https://tenor.com/view/sopita-de-fideo-noodle-soup-mexican-noodles-gif-15167113"],
	["burger", "https://c.tenor.com/tdFqDJemKpUAAAAC/mcdonalds-big-mac.gif"],
	["poop", "https://c.tenor.com/RrkaJ9JlVUgAAAAC/cake-eat.gif"],
	["66", "https://media1.tenor.com/images/fb7250a2ef993a37e9c7f48af760821c/tenor.gif"],
	["help", "https://i.giphy.com/media/WNJGAwRW1LFG5T4qOs/giphy.webp"],
	["ice", "https://i.giphy.com/media/cGymv7T9ZzDdLGczy7/giphy.webp"],
	["fire", "https://i.giphy.com/media/Qre4feuyNhiYIzD7hC/200.gif"],
	["popcorn", "https://tenor.com/view/thriller-michael-jackson-eating-popcorn-watching-gif-5577709"],
];

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("order")
		.setDescription("Get something special")
		.addStringOption((option) =>
			option.setName("item").setDescription("The item you want!").addChoices(options).setRequired(true),
		),
	execute: async (interaction: CommandInteraction, client: Client) => {
		let followMessage: Message;
		let message: Message;

		interaction.reply({
			content: `${interaction.options.getString("item")}`,
		});
		message = (await interaction.fetchReply()) as Message;

		// send an anotation following the gif
		for (const option of options) {
			if (option[1] === interaction.options.getString("item")) {
				switch (option[0]) {
					case "soup":
						followMessage = (await (client.channels.cache.get(interaction.channel.id) as TextChannel).send(
							"Gutten Appetit",
						)) as Message;
						break;
					case "pizza":
						followMessage = (await (client.channels.cache.get(interaction.channel.id) as TextChannel).send(
							"Buon Appetito!",
						)) as Message;
					default:
						break;
				}
			}
		}

		if (followMessage)
			followMessage.deleteReact({
				authorMessage: followMessage,
				previousMessage: message,
				authorID: interaction.user.id,
				deleteAuthorMessage: true,
			});
		else message.deleteReact({ authorMessage: message, authorID: interaction.user.id, deleteAuthorMessage: false });
	},
};
