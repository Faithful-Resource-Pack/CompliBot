const settings = require("../../resources/settings.json");

const getMessages = require("../../helpers/getMessages");
const texturesCollection = require("../../helpers/firestorm/texture");
const contributionsCollection = require("../../helpers/firestorm/contributions");
const pushTextures = require("./pushTextures");
const date = require("../../helpers/date.js");

const Buffer = require("buffer/").Buffer;
const { promises, writeFile } = require("fs");

/**
 * Download textures from a given channel to all its paths locally
 * @author Juknum, Evorp
 * @param {import("discord.js").Client} client
 * @param {String} channelResultID result channel to download from
 * @param {Boolean?} instapass whether to push the texture directly after downloading
 */
module.exports = async function downloadResults(client, channelResultID, instapass = false) {
	let messages = await getMessages(client, channelResultID);
	const channel = client.channels.cache.get(channelResultID);

	// finding which pack the channel "belongs" to
	let repoKey;
	for (let [packKey, packValue] of Object.entries(settings.submission.packs)) {
		if (packValue.channels.results == channelResultID) {
			repoKey = packKey;
			break;
		}
	}

	// removes non-submission messages
	messages = messages
		.filter((message) => message.embeds.length > 0)
		.filter((message) => message?.embeds[0]?.fields[1]);

	let textures;
	if (!instapass) {
		// get messages from the same day
		let delayedDate = new Date();
		messages = messages.filter((message) => {
			let messageDate = new Date(message.createdTimestamp);
			return (
				messageDate.getDate() == delayedDate.getDate() &&
				messageDate.getMonth() == delayedDate.getMonth() &&
				messageDate.getFullYear() == delayedDate.getFullYear()
			);
		});

		// keep good textures
		messages = messages.filter(
			(message) =>
				message.embeds[0].fields[1] !== undefined &&
				message.embeds[0].fields[1].value.includes(settings.emojis.upvote),
		);

		messages.reverse(); // upload them from the oldest to the newest
	} else {
		for (let msg of messages) {
			if (msg.embeds[0].fields[1].value.includes(settings.emojis.instapass)) {
				messages = [msg]; // converts to an array so map() can be used on it
				break;
			}
		}
	}

	textures = messages.map((message) => {
		return {
			url: message.embeds[0].thumbnail.url,
			authors: message.embeds[0].fields[0].value
				.split("\n")
				.map((auth) => auth.replace("<@!", "").replace(">", "")),
			date: message.createdTimestamp,
			id: message.embeds[0].title.match(/(?<=\[\#)(.*?)(?=\])/),
		};
	});

	// for each texture:
	let allContribution = new Array();
	let instapassName; // there's probably a better way to get the texture name for instapassed embeds but oh well

	for (let texture of textures) {
		let textureInfo = await texturesCollection.get(texture.id);
		if (instapass) instapassName = textureInfo.name; // used in the commit message later

		let uses = await textureInfo.uses();

		let allPaths = new Array();
		// get all paths of the texture
		for (let use of uses) {
			let localPath =
				"./texturesPush/" +
				settings.repositories.repo_name[use.editions[0].toLowerCase()][repoKey]?.repo;

			let paths = await use.paths();

			// for all paths
			for (let path of paths) {
				let versions = path.versions;
				// for each version of each path
				for (let version of versions) allPaths.push(`${localPath}/${version}/${path.path}`);
			}
		}

		// get the texture image itself as a buffer
		const res = await fetch(texture.url);
		const buffer = await res.arrayBuffer();

		// download the texture to all its paths
		for (let path of allPaths) {
			// create full folder path
			await promises
				.mkdir(path.substr(0, path.lastIndexOf("/")), { recursive: true })
				.catch((err) => {
					if (process.env.DEBUG == "true") console.error(err);
				});

			// write texture to the corresponding path
			writeFile(path, Buffer.from(buffer), (err) => {
				if (process.env.DEBUG == "true")
					return err ? console.error(err) : console.log(`ADDED TO: ${path}`);
			});
		}

		// prepare the authors for the texture
		allContribution.push({
			date: texture.date,
			resolution: repoKey.includes("32") ? 32 : 64, // stupid workaround but it works
			pack: repoKey,
			texture: `${texture.id}`,
			authors: texture.authors,
		});

		// add contributor role to authors if possible
		const guild = client.guilds.cache.get(channel.guildId);
		const role = settings.submission.packs[repoKey].contributor_role;

		// if the pack doesn't have a designated role
		if (!role) continue;

		for (let author of texture.authors) {
			try {
				// fetch user with role info since you need it for adding roles
				const user = guild.members.cache.get(author);
				if (!user.roles.cache.has(role)) await user.roles.add(role);
			} catch {
				/* contributor can't be found or role can't be added */
			}
		}
	}

	let result = await contributionsCollection.addBulk(allContribution);

	if (instapass) await pushTextures(`Instapassed ${instapassName} from ${date()}`);
	if (process.env.DEBUG == "true") console.log("ADDED CONTRIBUTIONS: " + result.join(" "));
};
