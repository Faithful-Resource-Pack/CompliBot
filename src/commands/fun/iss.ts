import { LightstreamerClient, Subscription } from 'lightstreamer-client-web';
import type { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder } from "discord.js";

const client = new LightstreamerClient('https://push.lightstreamer.com', 'ISSLIVE');
const subscription = new Subscription('MERGE', ['NODE3000005'], ['Value']);
let level = "-";

subscription.addListener({
  onItemUpdate: (update) => {
    level = update.getValue('Value');
  },
});

client.subscribe(subscription);
client.connect();

export const command: SlashCommand = {
	data: new SlashCommandBuilder().setName("iss").setDescription("Show magic numbers."),
	async execute(interaction) {
		interaction
			.reply({
				content: `The ISS waste tank is at ${level} % capacity.`,
				withResponse: true,
			});
	},
};
