const settings = require("../../resources/settings.json");

const { Permissions } = require("discord.js");
const { magnify } = require("../textures/magnify");
const palette = require("../textures/palette");
const tile = require("../textures/tile");
const viewRaw = require("../textures/viewRaw");
const instapass = require("./instapass");
const changeStatus = require("./changeStatus");

/**
 * Opens reaction tray, listens for reaction, and closes tray
 * @author Juknum
 * @param {DiscordClient} client
 * @param {DiscordReaction} reaction
 * @param {DiscordUser} user
 */
module.exports = async function reactionMenu(client, reaction, user) {
	if (reaction.emoji.id !== settings.emojis.see_more) return;

	const message = await reaction.message.fetch();
	const member = await message.guild.members.cache.get(user.id);
	if (member.bot || !message.embeds[0]?.fields?.length) return;

	// first author in the author field is always the person who submitted
	const authorID = await message.embeds[0].fields[0].value
		.split("\n")
		.map((el) => el.replace("<@", "").replace("!", "").replace(">", ""))[0];

	// remove the arrow emoji and generate the tray
	reaction.remove().catch((err) => {
		if (process.DEBUG) console.error(err);
	});

	let EMOJIS = [
		settings.emojis.see_less,
		settings.emojis.delete,
		settings.emojis.instapass,
		settings.emojis.invalid,
		settings.emojis.magnify,
		settings.emojis.palette,
		settings.emojis.tile,
		settings.emojis.view_raw,
	];

	// if the submission isn't pending, instapassing/invalid won't do anything so we remove those
	if (!message.embeds[0].fields[1].value.includes(settings.emojis.pending))
		EMOJIS = EMOJIS.filter(
			(emoji) =>
				emoji !== settings.emojis.instapass &&
				emoji !== settings.emojis.invalid &&
				emoji !== settings.emojis.delete,
		);

	// if the submission is in council remove delete reaction (avoid misclick)
	const councilChannels = Object.values(settings.submission.packs).map((i) => i.channels.council);
	if (councilChannels.includes(message.channel.id)) {
		EMOJIS = EMOJIS.filter((emoji) => emoji !== settings.emojis.delete);
	}

	// actually react
	for (let emoji of EMOJIS) await message.react(emoji);

	// make the filter
	const filter = (REACT, USER) => {
		return EMOJIS.includes(REACT.emoji.id) && USER.id === user.id;
	};

	// await reaction from the user
	const collected = await message
		.awaitReactions({ filter, max: 1, time: 30000, errors: ["time"] })
		.catch(async (err) => {
			if (message.deletable) {
				removeReact(message, EMOJIS);
				await message.react(client.emojis.cache.get(settings.emojis.see_more));
			}

			console.log(err);
		});

	// if there's no reaction collected just reset the message and return early
	const REACTION = collected?.first();
	if (!REACTION) {
		if (message.deletable) {
			removeReact(message, EMOJIS);
			await message.react(client.emojis.cache.get(settings.emojis.see_more));
		}
		return;
	}

	// get the user id from the person who reacted to check permissions
	const USER_ID = [...REACTION.users.cache.values()]
		.filter((user) => user.bot === false)
		.map((user) => user.id)[0];

	// image-related emojis and deletion
	const image = message.embeds[0].thumbnail.url;
	switch (REACTION.emoji.id) {
		case settings.emojis.magnify:
			magnify(message, image, user.id);
			break;
		case settings.emojis.palette:
			palette(message, image, user.id);
			break;
		case settings.emojis.tile:
			tile(message, image, "grid", user.id);
			break;
		case settings.emojis.view_raw:
			viewRaw(message, image, user.id);
			break;
		case settings.emojis.delete:
			// delete message only if the first author of the field 0 is the discord user who reacted, or if the user who react is admin
			if (USER_ID === authorID || member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
				await message.delete();
			break;
	}

	// instapass and invalid need role checks
	if (
		member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
		member.roles.cache.some((role) => role.name.toLowerCase().includes("council"))
	) {
		switch (REACTION.emoji.id) {
			case settings.emojis.instapass:
				// flush votes (you still need to clear the reaction menu afterwards)
				removeReact(message, [settings.emojis.upvote, settings.emojis.downvote]);
				changeStatus(
					message,
					`<:instapass:${settings.emojis.instapass}> Instapassed by <@${member.id}>`,
					settings.colors.yellow,
				);
				instapass(client, message);
				break;
			case settings.emojis.invalid:
				removeReact(message, [settings.emojis.upvote, settings.emojis.downvote]);
				changeStatus(
					message,
					`<:invalid:${settings.emojis.invalid}> Invalidated by <@${member.id}>`,
					settings.colors.red,
				);
				break;
		}
	}

	// reset reactions
	removeReact(message, EMOJIS);
	await message.react(client.emojis.cache.get(settings.emojis.see_more));
};

async function removeReact(message, emojis) {
	for (let emoji of emojis) {
		await message.reactions.cache
			.get(emoji)
			.remove()
			.catch((err) => {
				if (process.DEBUG) console.error(`Can't remove emoji: ${emoji}\n${err}`);
			});
	}
}
