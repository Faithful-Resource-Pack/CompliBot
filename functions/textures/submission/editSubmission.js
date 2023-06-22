const settings = require("../../../resources/settings.json");

const { Permissions } = require("discord.js");
const { magnify } = require("../magnify");
const { palette } = require("../palette");
const { tile } = require("../tile");
const { viewRaw } = require("../viewRaw");
const { instapass } = require("./instapass");
const { changeStatus } = require("./changeStatus");

/**
 * Reaction features for submissions
 * @author Juknum
 * @param {DiscordClient} client
 * @param {DiscordReaction} reaction
 * @param {DiscordUser} user
 */
async function editSubmission(client, reaction, user) {
	const message = await reaction.message.fetch();
	const member = await message.guild.members.cache.get(user.id);
	if (member.bot) return;
	if (message.embeds.length == 0 || message.embeds[0].fields.length == 0) return;

	const authorID = await message.embeds[0].fields[0].value
		.split("\n")
		.map((el) => el.replace("<@", "").replace("!", "").replace(">", ""))[0];

	if (reaction.emoji.id !== settings.emojis.see_more && reaction.emoji.id !== settings.emojis.see_more_old) return;

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

	// if the message does not have up/down vote react, remove INSTAPASS & INVALID from the emojis list (already instapassed or votes flushed)
	if (!message.embeds[0].fields[1].value.includes(settings.emojis.pending))
		EMOJIS = EMOJIS.filter(
			(emoji) =>
				emoji !== settings.emojis.instapass && emoji !== settings.emojis.invalid && emoji !== settings.emojis.delete,
		);

	// if the message is in #council-vote remove delete reaction (avoid misclick)
	const councilChannels = Object.values(settings.submission.packs).map((i) => i.channels.council);

	if (councilChannels.includes(message.channel.id)) {
		EMOJIS = EMOJIS.filter((emoji) => emoji !== settings.emojis.delete);
	}

	// add reacts
	for (let emoji of EMOJIS) await message.react(emoji);

	// make the filter
	const filter = (REACT, USER) => {
		return EMOJIS.includes(REACT.emoji.id) && USER.id === user.id;
	};

	// await reaction from the user
	message
		.awaitReactions({ filter, max: 1, time: 30000, errors: ["time"] })
		.then(async (collected) => {
			const REACTION = collected.first();
			const USER_ID = [...collected.first().users.cache.values()]
				.filter((user) => user.bot === false)
				.map((user) => user.id)[0];

			switch (REACTION.emoji.id) {
				case settings.emojis.magnify:
					magnify(message, message.embeds[0].thumbnail.url, user.id);
					break;
				case settings.emojis.palette:
					palette(message, message.embeds[0].thumbnail.url, user.id);
					break;
				case settings.emojis.tile:
					tile(message, message.embeds[0].thumbnail.url, "grid", user.id);
					break;
				case settings.emojis.view_raw:
					viewRaw(message, message.embeds[0].thumbnail.url, user.id);
					break;
			}

			if (
				member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
				member.roles.cache.some((role) => role.name.toLowerCase().includes("council"))
			) {
				if (REACTION.emoji.id === settings.emojis.instapass) {
					removeReact(message, [settings.emojis.upvote, settings.emojis.downvote]);
					changeStatus(
						message,
						`<:instapass:${settings.emojis.instapass}> Instapassed by <@${member.id}>`,
						settings.colors.yellow,
					);
					instapass(client, message);
				} else if (REACTION.emoji.id === settings.emojis.invalid) {
					removeReact(message, [settings.emojis.upvote, settings.emojis.downvote]);
					changeStatus(
						message,
						`<:invalid:${settings.emojis.invalid}> Invalidated by <@${member.id}>`,
						settings.colors.red,
					);
				}
			}

			// delete message only if the first author of the field 0 is the discord user who reacted, or if the user who react is admin
			if (
				REACTION.emoji.id === settings.emojis.delete &&
				(USER_ID === authorID || member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
			)
				return await message.delete();

			removeReact(message, EMOJIS);
			await message.react(client.emojis.cache.get(settings.emojis.see_more));
		})
		.catch(async (err) => {
			if (message.deletable) {
				removeReact(message, EMOJIS);
				await message.react(client.emojis.cache.get(settings.emojis.see_more));
			}

			console.log(err);
		});
}

async function removeReact(message, emojis) {
	for (let i = 0; emojis[i]; i++) {
		await message.reactions.cache
			.get(emojis[i])
			.remove()
			.catch((err) => {
				if (process.DEBUG) console.error(`Can't remove emoji: ${emojis[i]}\n${err}`);
			});
	}
}

exports.editSubmission = editSubmission;
