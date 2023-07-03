const textures = require("./firestorm/texture");
const paths = require("./firestorm/texture_paths");

/**
 * Search for a given texture and return details
 * @author Juknum
 * @param {String} search texture name to search for
 * @returns array of results
 */
module.exports = async function getTexture(search) {
	let results;
	// partial texture name (_sword, _axe -> diamond_sword, diamond_axe...)
	if (search.startsWith("_") || search.endsWith("_")) {
		results = await textures.search([
			{
				field: "name",
				criteria: "includes",
				value: search,
			},
		]);
	}
	// looking for path + texture (block/stone -> stone)
	else if (search.startsWith("/") || search.endsWith("/")) {
		results = await paths.search([
			{
				field: "path",
				criteria: "includes",
				value: search,
			},
		]);
		// transform paths results into textures
		let output = new Array();
		for (let result of results) {
			let use = await result.use();
			output.push(await textures.get(use.textureID));
		}
		results = output;
	}
	// looking for all exact matches (stone -> stone.png)
	else {
		results = await textures.search([
			{
				field: "name",
				criteria: "==",
				value: search,
			},
		]);

		if (!results.length) {
			// no equal result, searching with includes
			results = await textures.search([
				{
					field: "name",
					criteria: "includes",
					value: search,
				},
			]);
		}
	}
	return results;
};
