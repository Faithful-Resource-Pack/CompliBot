const strings = require("../../resources/strings.json");

module.exports = {
	name: "behave",
	guildOnly: false,
	async execute(client, message, args) {
		if (!process.env.DEVELOPERS.includes(message.author.id))
			return await message.reply({ content: "lol no" });

		if (args?.length && args[0].includes("/channels/")) {
			let ids;
			const link = args[0];
			const url = new URL(link).pathname;
			if (link.startsWith("https://canary.discord.com/channels/"))
				ids = url.replace("/channels/", "").split("/");
			else if (link.startsWith("https://discord.com/channels/"))
				ids = url.replace("/channels/", "").replace("message", "").split("/");
			else if (link.startsWith("https://discordapp.com/channels/"))
				ids = url.replace("/channels/", "").split("/");
			else return await message.reply({ content: strings.command.behave });

			/** @type {import("discord.js").TextChannel} */
			const channel = message.guild.channels.cache.get(ids[1]);
			const messageToBehave = await channel.messages.fetch(ids[2]);

			// delete command message
			await message.delete();

			// reply to link message
			return await messageToBehave.reply({ content: strings.command.behave });
		}

		return await message.reply({ content: strings.command.behave });
	},
};
