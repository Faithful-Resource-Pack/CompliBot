// This code is based on the GeyserMC Discord Bot (https://github.com/GeyserMC/GeyserDiscordBot)

const axios = require('axios')

const minecraftVersionsCache = []
const minecraftArticlesCache = []

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
	try {
		const { status, data: versions } = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest.json')

		if (versions === '' || status !== 200) {
			return
		}
  
		versions.versions.forEach(version => {
			if (!minecraftVersionsCache.includes(version.id)) {
				minecraftVersionsCache.push(version.id)
				client.channels.cache.get('773983707299184703').send({content: `A new ${version.type} version of Minecraft Java was just released: \`${version.id}\``})
			}
		})
	} catch (e) {
		return
	}
}

exports.loadMCArticles = async () =>  {
	const { status, data: article_grid } = await axios.get('https://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid')

	if (article_grid === '' || status !== 200) {
		console.log('Failed to load Java Minecraft articles')
		return
	}

	article_grid.article_grid.forEach(article => {
		if (!article.default_tile.title.includes("Minecraft Snapshot")) return
		minecraftArticlesCache.push(article.default_tile.title)
	})

	console.log(`Loaded ${minecraftArticlesCache.length} Java Minecraft articles`)
}

exports.updateMCArticles = async (client) => {
	try {
		const { status, data: article_grid } = await axios.get('https://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid')

		if (article_grid === '' || status !== 200) {
			return
		}
  
		article_grid.article_grid.forEach(article => {
			if (!article.default_tile.title.includes("Minecraft Snapshot")) return
			if (!minecraftArticlesCache.includes(article.default_tile.title)) {
				minecraftArticlesCache.push(article.default_tile.title)
				client.channels.cache.get('773983707299184703').send({content: `https://www.minecraft.net/en-us/article/${article.default_tile.title.replace(/ /g,"-").toLowerCase()}`})
			}
		})
	} catch (e) {
		return
	}
}