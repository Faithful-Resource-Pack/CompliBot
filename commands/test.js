const { textureCouncil }    = require('../functions/textures_submission/textureCouncil');
const { textureSubmission } = require('../functions/textures_submission/textureSubmission');
const settings = require('../settings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

/*
 * This is for debugging texture submission process during migration
*/

module.exports = {
	name: 'test',
	async execute(client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {
			textureSubmission(client,settings.C32_SUBMIT_1,settings.C32_SUBMIT_2,5);
		}
	}
}