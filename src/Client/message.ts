import { Message, DiscordAPIError, MessageEmbed, Client } from 'discord.js';
import { Config } from '~/Interfaces';
import ConfigJson from '@/config.json';
import { APIMessage } from 'discord-api-types';

export default class ExtendedMessage extends Message {
	constructor(client: Client, data: APIMessage) {
		super(client, data);
	}
	public config: Config = ConfigJson;

	/**
	 * Reply to a user with an embed, used to warn that user about something
	 *  @author Juknum
	 */
	public warn(text: string) {
		const embed = new MessageEmbed()
			.setColor(this.config.colors.red)
			.setThumbnail('https://database.compliancepack.net/images/bot/warning.png')
			.setTitle('Action failed')
			.setDescription(text)
			.setFooter(`Type ${this.config.prefix}help to get more information about commands`, this.client.user.displayAvatarURL());

		if (this.deleted) this.channel.send({ embeds: [embed] });
		else this.reply({ embeds: [embed] });

		// todo: add delete reaction
	}
}
