const settings = require("@resources/settings.json");

const getMessages = require("@helpers/getMessages");
const pushTextures = require("./pushTextures");
const formattedDate = require("@helpers/formattedDate");
const DEBUG = process.env.DEBUG.toLowerCase() == "true";

const { promises, writeFile } = require("fs");
const getPackByChannel = require("./utility/getPackByChannel");
const { default: axios } = require("axios");

/**
 * Push textures from a channel to all its paths locally and add contributions
 * @author Juknum, Evorp
 * @param {import("discord.js").Client} client
 * @param {String} channelResultID result channel to download from
 * @param {Boolean?} instapass whether to push the texture directly after downloading
 */
module.exports = async function downloadResults(client, channelResultID, instapass = false) {
	let messages = await getMessages(client, channelResultID);
	const channel = client.channels.cache.get(channelResultID);
	const packName = await getPackByChannel(channelResultID, "results");

	if (DEBUG) console.log(`Starting texture download for pack: ${packName}`);

	// removes non-submission messages
	messages = messages.filter((message) => message.embeds?.[0]?.fields?.[1]);

	if (!instapass) {
		// get messages from the same day
		const delayedDate = new Date();
		messages = messages.filter((message) => {
			let messageDate = new Date(message.createdTimestamp);
			return (
				messageDate.getDate() == delayedDate.getDate() &&
				messageDate.getMonth() == delayedDate.getMonth() &&
				messageDate.getFullYear() == delayedDate.getFullYear()
			);
		});

		// filter out rejected textures
		messages = messages.filter((message) =>
			message.embeds[0].fields[1]?.value?.includes(settings.emojis.upvote),
		);

		messages.reverse(); // upload them from the oldest to the newest
	} else {
		for (let msg of messages) {
			if (msg.embeds[0].fields[1]?.value?.includes(settings.emojis.instapass)) {
				// converts to an array so map() can be used on it
				messages = [msg];
				// only one texture instapassed at a time, so this is the most recent texture
				break;
			}
		}
	}

	// mapped for easier usage later
	const textures = messages.map((message) => {
		return {
			url: message.embeds[0].thumbnail.url,
			authors: message.embeds[0].fields[0].value
				.split("\n")
				.map((auth) => auth.replace("<@!", "").replace(">", "")),
			date: message.createdTimestamp,
			id: (message.embeds[0].title.match(/(?<=\[\#)(.*?)(?=\])/) ?? ["NO ID FOUND"])[0],
		};
	});

	// holds all contributions from the day
	let allContribution = [];
	// used in the instapass commit message if applicable
	let instapassName;

	for (let texture of textures) {
		if (isNaN(Number(texture.id))) {
			if (DEBUG) console.error(`Non-numerical texture ID found: ${texture.id}`);
			continue;
		}

		const imageFile = (await axios.get(texture.url, { responseType: "arraybuffer" })).data;

		/** @type {import("../../helpers/jsdoc").Texture} */
		const textureInfo = (await axios.get(`https://api.faithfulpack.net/v2/textures/${texture.id}/all`)).data;

		// add the image to all its versions and paths
		for (let use of textureInfo.uses) {
			const paths = textureInfo.paths.filter((i) => i.use == use.id);
			const edition = use.edition.toLowerCase();
			const folder = settings.repositories.repo_name[edition][packName]?.repo;
			if (!folder && DEBUG)
				console.log(`GitHub repository not found for pack and edition: ${packName} ${edition}`);
			const basePath = `./texturesPush/${folder}`;

			// for all paths
			for (let path of paths) {
				// for each version of each path
				for (let version of path.versions) {
					const fullPath = `${basePath}/${version}/${path.name}`;

					// make full folder chain
					await promises
						// removes the texture name from the full path
						.mkdir(fullPath.substring(0, fullPath.lastIndexOf("/")), { recursive: true })
						.catch((err) => {
							if (DEBUG) console.error(err);
						});

					// write texture to previously generated path
					writeFile(fullPath, Buffer.from(imageFile), (err) => {
						if (DEBUG) return console.log(err ?? `Added texture to path: ${fullPath}`);
					});
				}
			}
		}

		// prepare the authors for the texture
		allContribution.push({
			date: texture.date,
			resolution: Number((packName.match(/\d+/) ?? [32])[0]), // stupid workaround but it works
			pack: packName,
			texture: texture.id,
			authors: texture.authors,
		});

		// add contributor role to authors if possible
		const guild = client.guilds.cache.get(channel.guildId);
		const role = settings.submission.packs[packName].contributor_role;

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

	try {
		await axios.post(`https://api.faithfulpack.net/v2/contributions`, allContribution, {
			headers: {
				bot: process.env.API_TOKEN,
			}
		});
		if (DEBUG) console.log(`Added contributions: ${allContribution}`);
	} catch {
		if (DEBUG) console.error(`Couldn't add contributions for pack: ${packName}`);
	}

	if (instapass) await pushTextures(`Instapassed ${instapassName} from ${formattedDate()}`);
};
