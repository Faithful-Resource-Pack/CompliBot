const firestorm = require(".");
const texture = require("./texture");
const users = require("./users");

require("./firestorm_config")();

/**
 * @typedef {Object} Contribution
 * @property {String} date date of contribution
 * @property {Number} textureID texture's id modified
 * @property {String[]} contributors authors of the contribution
 * @property {String} res res of contribution (c32, c64)
 * @property {Function} getContributors users assiocated to this contribution
 * @property {Function} texture texture assiocated to this contribution
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
