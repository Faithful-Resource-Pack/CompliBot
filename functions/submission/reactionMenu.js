const settings = require("../../resources/settings.json");

const { Permissions } = require("discord.js");
const instapass = require("./utility/instapass");
const changeStatus = require("./utility/changeStatus");
const { imageButtons } = require("../../helpers/buttons");
const DEBUG = process.env.DEBUG.toLowerCase() == "true";
/**
 * Opens reaction tray, listens for reaction, and closes tray
 * @author Evorp, Juknum
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").MessageReaction} menuReaction
 * @param {import("discord.js").User} user person who reacted
 * @see interactionCreate (where all button stuff is handled)
 */
module.exports = async function reactionMenu(client, menuReaction, user) {
	const message = await menuReaction.message.fetch();
	const member = await message.guild.members.cache.get(user.id);
	if (member.bot) return;

	let trayReactions = [
		settings.emojis.see_less,
		settings.emojis.delete,
		settings.emojis.instapass,
		settings.emojis.invalid,
	];

	// if you don't check to close tray first, the bot won't listen for reactions upon restart
	if (menuReaction.emoji.id == settings.emojis.see_less) {
		removeReact(message, trayReactions);
		await message.react(client.emojis.cache.get(settings.emojis.see_more));
	}

	if (menuReaction.emoji.id !== settings.emojis.see_more || !message.embeds[0]?.fields?.length)
		return;
	if (DEBUG) console.log(`Reaction tray opened by: ${user.username}`);

	// first author in the author field is always the person who submitted
	const authorID = message.embeds[0].fields[0].value.split("\n")[0].replace(/\D+/g, "");

	if (
		// break early if the user doesn't have permission or the submission isn't pending
		(!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
			!member.roles.cache.some((role) => role.name.toLowerCase().includes("council")) &&
			authorID !== user.id) ||
		!message.embeds[0].fields[1].value.includes(settings.emojis.pending)
	)
		return menuReaction.users.remove(user.id).catch((err) => {
			if (DEBUG) console.error(err);
		});

	// remove the arrow emoji and generate the tray
	menuReaction.remove().catch((err) => {
		if (DEBUG) console.error(err);
	});

	// if the submission is in council remove delete reaction (avoid misclick)
	const councilChannels = Object.values(settings.submission.packs).map((i) => i.channels.council);
	if (councilChannels.includes(message.channel.id)) {
		trayReactions = trayReactions.filter((emoji) => emoji !== settings.emojis.delete);
	}

	// remove instapass/invalid if just the author is reacting
	if (
		!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) &&
		!member.roles.cache.some((role) => role.name.toLowerCase().includes("council"))
	)
		trayReactions = trayReactions.filter(
			(emoji) => emoji !== settings.emojis.instapass && emoji !== settings.emojis.invalid,
		);

	// actually react
	for (let emoji of trayReactions) await message.react(emoji);

	// make the filter
	const filter = (REACT, USER) => {
		return trayReactions.includes(REACT.emoji.id) && USER.id === user.id;
	};

	// await reaction from the user
	const collected = await message
		.awaitReactions({ filter, max: 1, time: 30000, errors: ["time"] })
		.catch(async (err) => {
			if (message.deletable) {
				removeReact(message, trayReactions);
				await message.react(client.emojis.cache.get(settings.emojis.see_more));
			}

			console.log(err);
		});

	const actionReaction = collected?.first();

	// if there's no reaction collected just reset the message and return early
	if (!actionReaction) {
		if (message.deletable) {
			removeReact(message, trayReactions);
			await message.react(client.emojis.cache.get(settings.emojis.see_more));
		}
		return;
	}

	// get the user id from the person who reacted to check permissions
	const USER_ID = [...actionReaction.users.cache.values()]
		.filter((user) => !user.bot)
		.map((user) => user.id)[0];

	if (
		actionReaction.emoji.id == settings.emojis.delete &&
		(USER_ID === authorID || member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) &&
		message.deletable
	)
		return await message.delete();

	// instapass and invalid need role checks
	if (
		member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
		member.roles.cache.some((role) => role.name.toLowerCase().includes("council"))
	) {
		switch (actionReaction.emoji.id) {
			case settings.emojis.instapass:
				// flush votes and reaction menu
				removeReact(message, [settings.emojis.upvote, settings.emojis.downvote, ...trayReactions]);
				changeStatus(
					message,
					`<:instapass:${settings.emojis.instapass}> Instapassed by <@${member.id}>`,
					settings.colors.yellow,
					[imageButtons],
				);
				return instapass(client, message);
			case settings.emojis.invalid:
				removeReact(message, [settings.emojis.upvote, settings.emojis.downvote, ...trayReactions]);
				return changeStatus(
					message,
					`<:invalid:${settings.emojis.invalid}> Invalidated by <@${member.id}>`,
					settings.colors.red,
				);
		}
	}

	// reset reactions if nothing happened
	removeReact(message, trayReactions);
	await message.react(client.emojis.cache.get(settings.emojis.see_more));
};

/**
 * remove a given set of reactions
 * @author Juknum
 * @param {import("discord.js").Message} message
 * @param {String} emojis
 */
async function removeReact(message, emojis) {
	for (let emoji of emojis) {
		await message.reactions.cache
			.get(emoji)
			?.remove()
			?.catch((err) => {
				/* reaction can't be removed */
			});
	}
}
