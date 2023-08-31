const strings = require("@resources/strings.json");
const settings = require("@resources/settings.json");

const warnUser = require("@helpers/warnUser");

const activity = ["PLAYING", "STREAMING", "LISTENING", "WATCHING", "COMPETING", "NONE"];
const presence = ["online", "idle", "dnd"];

module.exports = {
	name: "status",
	aliases: ["presence", "activity"],
	guildOnly: false,
	async execute(client, message, args) {
		if (!process.env.DEVELOPERS.includes(message.author.id))
			return warnUser(message, strings.command.no_permission);

		if (!args.length) return warnUser(message, strings.command.args.none_given);

		// since args is converted to lowercase in the handler we need to undo that
		args[0] = args[0].toUpperCase();
		if (activity.includes(args[0]) && presence.includes(args[1])) {
			if (args[0] == "NONE") args[0] = "CUSTOM";
			client.user.setPresence({
				activities: [
					{
						name: args.join(" ").replace(args[0], "").replace(args[1], ""),
						type: args[0],
					},
				],
				status: args[1],
			});
			return await message.react(settings.emojis.upvote);
		}
		return await message.react(settings.emojis.downvote);
	},
};
