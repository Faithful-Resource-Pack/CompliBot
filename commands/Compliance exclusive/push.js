/* eslint-disable no-unreachable */

const fs = require('fs');
const { string } = require('../../resources/strings');
const { REPO_NAMES: REPOSITORIES } = require('../../resources/settings');

const { Permissions } = require('discord.js');
const { parseArgs } = require('../../helpers/parseArgs');
const { warnUser } = require('../../helpers/warnUser');
const { pushTextures } = require('../../functions/textures/admission/pushTextures');
const texture_path = require('../../helpers/firestorm/texture_paths');
const contributions = require('../../helpers/firestorm/contributions');

module.exports = {
	name: 'push',
	description: string('command.description.push'),
	category: 'Compliance exclusive',
	guildOnly: false,
	uses: string('command.disabled'),
	//uses: string('command.use.mods'),
	syntax: `${process.env.PREFIX}push -r -n -a + file attached`,
	flags: '-r | --repo :\n\tCompliance-[Java|Bedrock]-[32x-64x]\n\
					-n | --path :\n\tTexture path \n\
					-a | --author :\n\tDiscord tag of texture\'s author.',
	example: `${process.env.PREFIX}push -r=Compliance-Java-32x -p=textures/block/stone.png -a=Someone#1234`,
	/**
	 * @param {import('discord.js').Client} client 
	 * @param {import('discord.js').Message} message 
	 * @param {String[]} args 
	 * @returns {Promise<any>}
	 */
	async execute(client, message, args) {
		return warnUser(message, 'NOT UPDATED TO THE NEW DATABASE SYSTEM')

		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) return warnUser(message, string('command.no_permission'))

		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return warnUser(message, string('command.no_permission'));

		args = parseArgs(message, args);

		var haveAuth = false;
		var havePath = false;
		var haveRepo = false;

		let authorID;
		let texturePath;
		let repositoryName;
		let textureResolution;
		let packEdition;

		// Check args:
		for (var i in args) {
			if (args[i].startsWith('-a=') || args[i].startsWith('--author=')) {
				haveAuth = true;
				authorID = args[i].replace('-a=', '').replace('--author=', '');
			}
			if (args[i].startsWith('-p=') || args[i].startsWith('--path=')) {
				havePath = true;
				texturePath = args[i].replace('-p=', '').replace('--path=', '');
			}
			if (args[i].startsWith('-r=') || args[i].startsWith('--repo=')) {
				haveRepo = true;
				repositoryName = args[i].replace('-r=', '').replace('--repo=');
			}
		}

		var warnMessage = '';
		// if (!haveAuth) warnMessage += strings.PUSH_ARG1_INVALID;
		// if (!havePath) warnMessage += strings.PUSH_ARG2_INVALID;
		// if (!haveRepo) warnMessage += strings.PUSH_ARG3_INVALID;
		// if (message.attachments.size == 0) warnMessage += strings.PUSH_NOT_ATTACHED;
		if (warnMessage != '') return warnUser(message, warnMessage);

		// Check repository:
		// if (!REPOSITORIES.includes(repositoryName)) return warnUser(message, strings.PUSH_INVALID_REPO);
		if (REPOSITORIES.indexOf(repositoryName) % 2 === 0) textureResolution = 32;
		else textureResolution = 64;

		// fetch author ID:
		try {
			authorID = client.users.cache.find(u => u.tag === authorID).id;
		} catch (error) {
			console.log('\n\n -------------- USER NOT FOUND IN CACHE --------------\n');
			console.error(error);
			console.log('\n -----------------------------------------------------');
			// return warnUser(message, strings.PUSH_USER_NOT_FOUND);
		}

		let versions

		return new Promise((resolve, reject) => {
			texture_path.search([{
				field: 'path',
				criteria: '==',
				value: texturePath
			}])
				.catch(err => {
					console.error(err)
					reject(err)
				})
				.then(search_results => {
					// no results
					if (search_results.length === 0) {
						// resolve(warnUser(message, strings.PUSH_TEXTURE_NOT_FOUND))
						return
					}

					/** @type {import('../../helpers/firestorm/texture_paths').TexturePath} */
					const result = search_results[0]

					versions = result.versions

					return result.use()
				})

				.then(use => {
					packEdition = Array.isArray(use.editions) ? use.editions[0] : '' + use.editions // to be more flexible if editions become string

					// I need to add a contribution with the author
					return Promise.all([
						contributions.add({
							date: (new Date()).getTime(),
							res: 'c' + textureResolution,
							textureID: parseInt(use.textureID, 10),
							contributors: [authorID]
						}),
						downloadAsBuffer(message.attachments.first().url)
					])
				})
				.then(async (results) => {
					const contributionID = results[0]
					const imageBuffer = results[1]

					console.log('Added contribution #' + contributionID)

					console.log(message, packEdition, repositoryName, textureResolution, versions);

					versions.forEach(async (version) => {
						await writeResource(repositoryName, version, packEdition, imageBuffer);
					})

					await pushTextures(`Manual Push for ${texturePath.split('/').pop()} executed by: ${message.author.username}`)
					await message.react('✅')
				})
				.catch(reject)
		})
	}
}

/**
 * @param {String} url Image to download
 * @returns {Promise<ArrayBuffer>} Image buffer
 */
function downloadAsBuffer(url) {
	return fetch(url)
		.then(response => response.buffer())
}

/**
 * @param {String} repoName Repo name
 * @param {String} branchFolderName Branch folder name
 * @param {"java"|"bedrock"} packEdition Pack edition
 * @param {String} texturePath Final location to write to
 * @param {string | Uint8Array} resourceBuffer Data written in file
 * @returns {Promise<void>} Succeeds went well
 */
async function writeResource(repoName, branchFolderName, packEdition, texturePath, resourceBuffer) {
	if (texturePath === null || texturePath === undefined || typeof texturePath !== 'string' || texturePath.length === 0) return Promise.reject(new Error(`texturePath is ${texturePath}`))
	if (!REPOSITORIES.includes(repoName)) return Promise.reject(new Error(`Incorrect repoName, got "${repoName}", expected ${REPOSITORIES.map(r => `"${r}"`).join(' or ')}`))

	// find path
	let valPathLocal = `./texturesPush/${repoName}/${branchFolderName}/${packEdition === 'java' ? 'assets/' : ''}${texturePath}`

	// create folder and write file
	return fs.promises.mkdir(valPathLocal.substr(0, valPathLocal.lastIndexOf('/')), { recursive: true })
		.then(() => {
			return fs.promises.writeFile(valPathLocal, resourceBuffer)
		})
		.then(() => {
			console.log(`ADDED: ${texturePath.split('/').pop()} TO: ${valPathLocal}\n`)
			return Promise.resolve()
		})
}