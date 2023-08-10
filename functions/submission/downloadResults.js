const settings = require("../../resources/settings.json");

const getMessages = require("../../helpers/getMessages");
const texturesCollection = require("../../helpers/firestorm/texture");
const contributionsCollection = require("../../helpers/firestorm/contributions");
const pushTextures = require("./pushTextures");
const formattedDate = require("../../helpers/formattedDate");
const DEBUG = process.env.DEBUG.toLowerCase() == "true";

const Buffer = require("buffer/").Buffer;
const { promises, writeFile } = require("fs");
const getPackByChannel = require("./getPackByChannel");

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
	const packName = await getPackByChannel(channelResultID, "results");

	if (DEBUG) console.log(`Starting texture download for pack: ${packName}`);

	// removes non-submission messages
	messages = messages.filter((message) => message.embeds?.[0]?.fields?.[1]);

	let textures;
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

		const textureInfo = await texturesCollection.get(texture.id);
		if (instapass) instapassName = textureInfo.name;

		// push all the texture's paths into array
		const uses = await textureInfo.uses();
		let allPaths = [];
		for (let use of uses) {
			const edition = use.editions[0].toLowerCase();
			const folder = settings.repositories.repo_name[edition][packName]?.repo;
			if (!folder && DEBUG)
				console.log(`GitHub repository not found for pack and edition: ${packName} ${edition}`);
			const basePath = `./texturesPush/${folder}`;

			const paths = await use.paths();

			// for all paths
			for (let path of paths) {
				const versions = path.versions;
				// for each version of each path
				for (let version of versions) allPaths.push(`${basePath}/${version}/${path.path}`);
			}
		}

		// get the texture image itself as a buffer
		const res = await fetch(texture.url);
		const buffer = await res.arrayBuffer();

		// use those generated paths to create the full path
		for (let path of allPaths) {
			// create full folder path
			await promises
				.mkdir(path.substring(0, path.lastIndexOf("/")), { recursive: true })
				.catch((err) => {
					if (DEBUG) console.error(err);
				});

			// write texture to the corresponding path
			writeFile(path, Buffer.from(buffer), (err) => {
				if (DEBUG) return err ? console.error(err) : console.log(`Added texture to path: ${path}`);
			});
		}

		// prepare the authors for the texture
		allContribution.push({
			date: texture.date,
			resolution: Number((packName.match(/\d+/) ?? [32])[0]), // stupid workaround but it works
			pack: packName,
			texture: `${texture.id}`,
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

	let contributionResults;
	try {
		contributionResults = await contributionsCollection.addBulk(allContribution);
	} catch {
		// couldn't add contributions (probably because in dev mode)
	}

	if (instapass) await pushTextures(`Instapassed ${instapassName} from ${formattedDate()}`);
	if (DEBUG)
		contributionResults
			? console.log(`Added contributions: ${contributionResults}`)
			: console.log(`Couldn't add contributions for pack: ${packName}`);
};
