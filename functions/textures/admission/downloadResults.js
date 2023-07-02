const getMessages = require("../../../helpers/getMessages");

const settings = require("../../../resources/settings.json");

const texturesCollection = require("../../../helpers/firestorm/texture");
const contributionsCollection = require("../../../helpers/firestorm/contributions");
const pushTextures = require("./pushTextures");
const fs = require("fs");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const date = require("../../../helpers/date.js");

const Buffer = require("buffer/").Buffer;

/**
 * Download textures from the given text channel
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelInID discord text channel from where the bot should download texture
 */
module.exports = async function downloadResults(client, channelInID, instapass = false) {
	let messages = await getMessages(client, channelInID);
	const channel = client.channels.cache.get(channelInID);
	let repoKey; // declared outside loop so there's no scope issues

	for (let [packKey, packValue] of Object.entries(settings.submission.packs)) {
		if (packValue.channels.results == channelInID) {
			repoKey = packKey;
			break;
		}
	}

	// removes non-submission messages
	messages = messages
		.filter((message) => message.embeds.length > 0)
		.filter(
			(message) => message.embeds[0] && message.embeds[0].fields && message.embeds[0].fields[1],
		);

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
			id: message.embeds[0].title
				.split(" ")
				.filter((el) => el.charAt(0) === "[" && el.charAt(1) === "#" && el.slice(-1) == "]")
				.map((el) => el.slice(2, el.length - 1))[0],
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
				for (let version of versions)
					allPaths.push(`${localPath}/${version}/${path.path}`);
			}
		}

		const res = repoKey.includes("32") ? 32 : 64;

		const response = await fetch(texture.url);
		const buffer = await response.arrayBuffer();

		// download the texture to all its paths
		for (let path of allPaths) {
			// create full folder path
			await fs.promises
				.mkdir(path.substr(0, path.lastIndexOf("/")), { recursive: true })
				.catch((err) => {
					if (process.DEBUG) console.error(err);
				});

			// write texture to the corresponding path
			fs.writeFile(path, Buffer.from(buffer), function (err) {
				if (err && process.DEBUG == "true") return console.error(err);
				else if (process.DEBUG == "true") return console.log(`ADDED TO: ${path}`);
			});
		}

		// prepare the authors for the texture
		allContribution.push({
			date: texture.date,
			resolution: res,
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
			} catch {/* contributor can't be found or role can't be added */}
		}
	}

	let result = await contributionsCollection.addBulk(allContribution);

	if (instapass) {
		await pushTextures(`Instapassed ${instapassName} from ${date()}`);
	}

	if (process.DEBUG) console.log("ADDED CONTRIBUTIONS: " + result.join(" "));
};
