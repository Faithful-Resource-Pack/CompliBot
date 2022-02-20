import { Message, MessageEmbed } from "@src/Extended Discord"
import { MessageAttachment } from "discord.js";
import { Config } from "@interfaces/config";
import ConfigJson from "@/config.json";
import { magnifyAttachment } from "./canvas/magnify";

export const addMinutes = (d: Date, minutes: number): Date => {
  return new Date(d.getTime() + minutes * 60000);
}

export const postSubmitedTextureEmbed = async (message: Message, texture: any, file: MessageAttachment) => {
  const config: Config = ConfigJson;
	const files: Array<MessageAttachment> = []; 
  const mentions = [...new Set([...Array.from(message.mentions.users.values()), message.author].map(user => user.id))];

  const embed = new MessageEmbed()
    .setTitle(`[#${texture.id}] ${texture.name}`)
    .setAuthor({ iconURL: message.author.avatarURL(), name: message.author.username })
    .addField('Tags', texture.tags.join(', '))
    .addField('Contributor(s)', `<@!${mentions.join('>\n<@!')}>`, true)
    .addField('Resource Pack', `\`${Object.keys(config.submitChannels).filter(key => config.submitChannels[key] === message.channel.id)[0]}\``, true)
    .addField('Pending until', `<t:${(addMinutes(new Date(), 4320).getTime() / 1000).toFixed(0)}>`, true) // 4320 is 3 days
    .setImage(file.url)
    .setThumbnail('attachment://magnified.png')

  if (message.content !== '' || message.content !== undefined) embed.setDescription(message.content);

  files.push(await magnifyAttachment({ url: file.url, name: 'magnified.png' }));
  message.channel.send({ embeds: [embed], files: [file, ...files]});
}