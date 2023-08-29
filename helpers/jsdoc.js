/**
 * since I'm too lazy to figure out typescript I made a bunch of JSDOC interfaces
 * they're used all throughout the bot for intellisense and easier debugging
 *
 * @typedef {"faithful 32x" | "faithful_64x" | "classic_faithful_32x" | "classic_faithful_64x" | "classic_faithful_32x_progart"} Pack
 *
 * @typedef Path
 * @property {String} id
 * @property {String} use
 * @property {String} name
 * @property {Boolean} animated
 * @property {String[]} versions
 *
 * @typedef Use
 * @property {String} id
 * @property {String} name
 * @property {"java" | "bedrock" | "dungeons"} edition
 *
 * @typedef Contribution
 * @property {String} id
 * @property {String} number unix timestamp
 * @property {String} texture texture id
 * @property {Number} resolution
 * @property {Pack} pack
 * @property {String[]} authors
 *
 * @typedef Texture
 * @property {String} id
 * @property {String} name
 * @property {String[]} tags
 * @property {Use[]} uses
 * @property {Path[]} paths
 * @property {Contribution[]?} contributions
 */
