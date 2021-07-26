// This code is based on the GeyserMC Discord Bot (https://github.com/GeyserMC/GeyserDiscordBot)

const axios = require('axios')

const jiraVersionsCache = []

exports.loadJiraVersions = async () =>  {
	const { status, data: versions } = await axios.get('https://bugs.mojang.com/rest/api/latest/project/MCPE/versions')

	if (versions === '' || status !== 200) {
		console.log('Failed to load Bedrock jira versions')
		return
	}

	versions.forEach(version => {
		jiraVersionsCache.push(version.name)
	})

	console.log(`Loaded ${jiraVersionsCache.length} Bedrock jira versions`)
}

exports.updateJiraVersions = async (client) => {
	try {
		const { status, data: versions } = await axios.get('https://bugs.mojang.com/rest/api/latest/project/MCPE/versions')

		if (versions === '' || status !== 200) {
			return
		}

		versions.forEach(version => {
			if (!jiraVersionsCache.includes(version.name)) {
				jiraVersionsCache.push(version.name)
				if (!version.name.includes('Future Version')) {
					client.channels.cache.get('773983707299184703').send(`A new Bedrock version has been added to the Minecraft issue tracker: \`${version.name}\``)
				}
			}
		})
	} catch(e) {
		return
	}
}