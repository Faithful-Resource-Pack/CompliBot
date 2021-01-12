const settings = require('../settings');
const simpleGit = require('simple-git');
const git = simpleGit();

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



		}
	}
}