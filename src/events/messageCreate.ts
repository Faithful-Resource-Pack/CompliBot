import { Event } from "@interfaces";
import { Client, Message, MessageEmbed } from "@client";
import { textureComparison } from "@functions/canvas/stitch";

export const event: Event = {
	name: "messageCreate",
	run: async (client: Client, message: Message) => {
		//! do not remove, 'force' message to be casted (break if removed)
		let _ = (message as Message) instanceof Message;

		let m = Object.assign({}, message); // lose reference to message: create unique instance of the message for the logger (ask @Juknum)
		m.isDeleted = false;
		client.storeAction("message", m);

		if (message.author.bot) return;

		/**
		 * easter eggs
		 */
		switch (message.content.toLocaleLowerCase()) {
			case "engineer gaming":
				try {
					await message.react("👷");
				} catch (err) {
					/* can't react */
				}
				break;
			case "rip":
			case "f":
				try {
					await message.react("🇫");
				} catch (err) {
					/* can't react */
				}
				break;
			case "band":
			case "banding":
				["🎤", "🎸", "🥁", "🪘", "🎺", "🎷", "🎹", "🪗", "🎻"].forEach(async (emoji) => {
					try {
						await message.react(emoji);
					} catch (err) {
						/* can't react */
					}
				});
				break;
			case "monke":
			case "monkee":
				["🎷", "🐒"].forEach(async (emoji) => {
					try {
						await message.react(emoji);
					} catch (err) {
						/* can't react */
					}
				});
				break;
			case "mhhh":
				const mhhhEmbed = new MessageEmbed()
					.setDescription("```Uh-oh moment```")
					.setFooter({ text: "Swahili → English" });
				message.reply({ embeds: [mhhhEmbed] }).then((message) => message.deleteButton(true));
				break;
			case "hello there":
				const helloEmbed = new MessageEmbed().setImage(
					Math.floor(Math.random() * 4) == 1 // why can't TS/JS just have a normal randint() function
						? "https://i.imgur.com/hAuUsnD.png"
						: "https://media1.tenor.com/images/8dc53503f5a5bb23ef12b2c83a0e1d4d/tenor.gif",
				);
				message.reply({ embeds: [helloEmbed] }).then((message) => message.deleteButton(true));
				break;
		}
		if (message.content.includes("(╯°□°）╯︵ ┻━┻"))
			return await message.reply({ content: "┬─┬ ノ( ゜-゜ノ) calm down bro" });

		/**
		 * texture ID quoting
		 * @author Evorp
		 * @see textureComparison()
		 */

		let textureID = [...message.content.matchAll(/(?<=\[\#)(.*?)(?=\])/g)].map((i) => i[0]);

		for (let arg of textureID) {
			let id: string | number;
			let display = "all";

			// check for [#template]
			const split = arg.toLowerCase().split(" ");
			if (split[0] == "template") {
				id = split[0];
				// check for template + display
				if (split.length > 1) display = split[1];

			} else if (!isNaN(Number(arg))) {
				// if no display is passed in
				id = arg;

			} else {
				// display is passed in so parse them separately
				id = arg.match(/\d+/g)[0];
				display = arg
					.match(/[a-zA-Z]+/g)[0]
					.toLowerCase()
					.trim();
			}

			try {
				const [embed, magnified] = await textureComparison(client, id, display);
				message
					.reply({ embeds: [embed], files: [magnified] })
					.then((message) => message.deleteButton());
			} catch {
				/* texture doesn't exist or failed or whatever*/
			}
		}
	},
};
