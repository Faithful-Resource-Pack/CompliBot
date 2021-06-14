// This code is based on the GeyserMC Discord Bot (https://github.com/GeyserMC/GeyserDiscordBot)

const axios = require('axios')

const minecraftVersionsCache = []

exports.loadMCVersions = async () =>  {
	const { status, data: versions } = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest.json')

	if (versions === '' || status !== 200) {
		console.log('Failed to load Java Minecraft versions')
		return
	}

	versions.versions.forEach(version => {
		minecraftVersionsCache.push(version.id)
	})

	console.log(`Loaded ${minecraftVersionsCache.length} Java Minecraft versions`)
}

exports.updateMCVersions = async (client) => {
	const { status, data: versions } = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest.json')
  
	if (versions === '' || status !== 200) {
		return
	}
  
	versions.versions.forEach(version => {
		if (!minecraftVersionsCache.includes(version.id)) {
			minecraftVersionsCache.push(version.id)
			client.channels.cache.get('773983707299184703').send(`A new ${version.type} version of Minecraft Java was just released: \`${version.id}\``)
		}
	})
}