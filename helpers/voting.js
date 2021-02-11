const settings = require('../settings');

module.exports = {
	generateEmbed(textureName, textureAuthor, textureURL, passed) {
		var embed = new Discord.MessageEmbed()
			.setAuthor(textureAuthor.tag, textureAuthor.displayAvatarURL())
			.setTitle(textureName)
			.setImage(textureURL);
    
		if (passed) {
			embed.setColor(settings.COLOR_GREEN)
			.setDescription('The following texture has passed council voting and will be added into the pack in a future version.')
		} else {
			embed.setColor(settings.COLOR_RED)
			.setDescription('The following texture has not passed council voting and will not be added into the pack in a future version.')
		}
	}
}