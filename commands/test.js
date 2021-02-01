const settings = require('../settings');

const { doPush } = require('../functions/doPush.js');
const { getResults } = require('../functions/textures_submission/getResults.js');
const { textureSubmission } = require('../functions/textures_submission/textureSubmission.js');
const { textureCouncil } = require('../functions/textures_submission/textureCouncil.js');
const { textureRevote } = require('../functions/textures_submission/textureRevote.js');


const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

/*
 * This is for debugging stuff
*/

module.exports = {
	name: 'test',
	async execute(client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {
			
			//getResults(client, settings.C32_RESULTS);
			//getResults(client, settings.C64_RESULTS);
			// Push them trough GitHub
			await textureSubmission(client,settings.C32_SUBMIT_1,settings.C32_SUBMIT_2,0);									  // 5 DAYS OFFSET
			//await textureCouncil(client,settings.C32_SUBMIT_2,settings.C32_SUBMIT_3,settings.C32_RESULTS,1);	// 1 DAYS OFFSET
			//await textureRevote(client,settings.C32_SUBMIT_3,settings.C32_RESULTS,3);

			//autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.17', 'Pushing textures')
			//autoPush('Compliance-Resource-Pack', 'Testing-autopush', 'main', 'testing stuff');

		}
	}
}