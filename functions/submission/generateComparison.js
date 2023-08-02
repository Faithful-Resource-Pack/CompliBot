const settings = require("../../resources/settings.json");
const stitch = require("../textures/stitch");
const { magnifyAttachment } = require("../textures/magnify");
const { loadImage } = require("@napi-rs/canvas");

/**
 * @author Evorp
 * @param {import("discord.js").Message} message
 * @param {import("discord.js").MessageAttachment} attachment
 * @param {{path: String, version: String, edition: String}} info
 * @returns {Promise<{comparisonImage: MessageAttachment, hasReference: Boolean}>}
 */
module.exports = async function generateComparison(message, attachment, info) {
	// determine reference image to compare against
	let repoKey;
	for (let [packKey, packValue] of Object.entries(settings.submission.packs)) {
		if (packValue.channels.submit == message.channel.id) {
			repoKey = packKey;
			break;
		}
	}

	let defaultRepo;
	switch (repoKey) {
		case "faithful_64x":
			defaultRepo = settings.repositories.raw.faithful_32x;
			break;
		case "classic_faithful_64x":
			defaultRepo = settings.repositories.raw.classic_faithful_32x;
			break;
		case "classic_faithful_32x_progart":
			defaultRepo = settings.repositories.raw.progart;
			break;
		default:
			defaultRepo = settings.repositories.raw.default;
			break;
	}

	const upscaledImage = await loadImage(attachment.url);
	let defaultImage;

	// load images necessary to generate comparison
	try {
		defaultImage = await loadImage(
			`${defaultRepo[info.edition.toLowerCase()]}${info.version}/${info.path}`,
		);
	} catch {
		// reference texture doesn't exist so we use the default repo
		defaultImage = await loadImage(
			`${settings.repositories.raw.default[info.edition.toLowerCase()]}${info.version}/${
				info.path
			}`,
		);
	}

	/** @type {import("@napi-rs/canvas").Image[]} */
	let images = [defaultImage, upscaledImage];

	try {
		const currentImage = await loadImage(
			`${settings.repositories.raw[repoKey][info.edition.toLowerCase()]}${info.version}/${
				info.path
			}`,
		);
		images.push(currentImage);
	} catch {
		// texture being submitted is a new texture, so there's nothing to compare against
	}

	// actually stitch the generated images
	const stitched = await stitch(images);
	return {
		comparisonImage: await magnifyAttachment(stitched, "compared.png"),
		hasReference: images.length == 3,
	};
};
