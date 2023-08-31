const settings = require("@resources/settings.json");
const stitch = require("@functions/images/stitch");
const { magnifyAttachment } = require("@functions/images/magnify");
const { loadImage } = require("@napi-rs/canvas");

/**
 * @author Evorp
 * @param {String} pack pack to compare against (e.g. faithful_32x, classic_faithful_64x)
 * @param {import("discord.js").MessageAttachment} attachment raw texture being submitted
 * @param {{path: String, version: String, edition: String}} info used for searching for references/current
 * @returns {Promise<{comparisonImage: MessageAttachment, hasReference: Boolean}>} compared texture and info
 */
module.exports = async function generateComparison(pack, attachment, info) {
	let defaultRepo;
	switch (pack) {
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

	/**
	 * IMAGE LOADING
	 */

	/** @type {import("@napi-rs/canvas").Image[]} */
	let images = [];

	try {
		images.push(
			await loadImage(`${defaultRepo[info.edition.toLowerCase()]}${info.version}/${info.path}`),
		);
	} catch {
		// reference texture doesn't exist so we use the default repo
		try {
			images.push(
				await loadImage(
					`${settings.repositories.raw.default[info.edition.toLowerCase()]}${info.version}/${
						info.path
					}`,
				),
			);
		} catch {
			// default texture doesn't exist either
		}
	}

	images.push(upscaledImage);

	try {
		images.push(
			await loadImage(
				`${settings.repositories.raw[pack][info.edition.toLowerCase()]}${info.version}/${
					info.path
				}`,
			),
		);
	} catch {
		// texture being submitted is a new texture, so there's nothing to compare against
	}

	// return early if the reference texture couldn't be fetched
	if (images.length == 1) {
		const img = await loadImage(images[0]);
		return {
			comparisonImage: await magnifyAttachment(img, "magnified.png"),
			hasReference: null,
		};
	}

	/**
	 * STITCH LOADED IMAGES
	 */
	const stitched = await stitch(images);
	return {
		comparisonImage: await magnifyAttachment(stitched, "compared.png"),
		hasReference: images.length == 3,
	};
};
