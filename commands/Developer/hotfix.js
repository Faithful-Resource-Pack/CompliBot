/* eslint-disable no-unused-vars */
const prefix = process.env.PREFIX

const fs = require('fs')

const settings = require('../../resources/settings.json')
const allCollection = require('../../helpers/firestorm/all')
const { retrieveSubmission } = require('../../functions/textures/submission/retrieveSubmission')
const { downloadResults } = require('../../functions/textures/admission/downloadResults')
const { pushTextures } = require('../../functions/textures/admission/pushTextures')
const { saveDB } = require('../../functions/saveDB')

const strings = require('../../resources/strings.json')

module.exports = {
	name: 'hotfix',
	aliases: ['fix'],
	description: strings.command.description.hotfix,
	category: 'Developer',
	guildOnly: false,
	uses: strings.command.use.devs,
	syntax: `${prefix}hotfix <something>`,
	async execute(client, message, args) {
		if (process.env.DEVELOPERS.includes(message.author.id)) {
			await pushTextures()
			await message.react(settings.emojis.upvote)
		} else return
	}
}
