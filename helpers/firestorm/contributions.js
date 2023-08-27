const firestorm = require(".");
const texture = require("./texture");
const users = require("./users");

require("./firestorm_config")();

/**
 * @typedef {Object} Contribution
 * @property {String} date date of contribution
 * @property {Number} textureID texture id
 * @property {String[]} contributors authors of the contribution
 * @property {String} res res of contribution (32, 64)
 * @property {Function} getContributors get users associated with this contribution
 * @property {Function} texture get the texture associated with this contribution
 */

module.exports = firestorm.collection("contributions", (el) => {
	/** @returns {Promise<import("./texture").Texture>} */
	el.getContributors = function () {
		return users.searchKeys(el.contributors || []);
	};

	/** @returns {Promise<import("./texture").Texture>} */
	el.texture = function () {
		return texture.get(el.textureID);
	};

	return el;
});
