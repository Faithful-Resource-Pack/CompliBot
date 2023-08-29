const settings = require("../../../resources/settings.json");

/**
 * get pack id (e.g. faithful_32x, classic_faithful_64x) by a given submission channel id
 * @author Evorp
 * @param {String} channelID channel id to test
 * @param {"all" | "submit" | "council" | "results"?} channelType optionally specify type of channel to search
 * @returns {Promise<String?>} key of pack
 */
module.exports = async function getPackByChannel(channelID, channelType = "all") {
	for (let [packKey, packValue] of Object.entries(settings.submission.packs)) {
		if (packValue.channels?.[channelType] == channelID) {
			return packKey;
		} else if (Object.values(packValue.channels).includes(channelID) && channelType == "all") {
			return packKey;
		}
	}
};
