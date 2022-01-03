import { MessageEmbed, TextChannel } from "discord.js";
import Client from "~/Client"
import Message from "~/Client/message"

export const unhandledRejection: Function = (client: Client, reason: any, promise: Promise<any>) => {
  const channel = client.channels.cache.get(client.config.channels.error) as TextChannel;

  const embed = new MessageEmbed()
    .setTitle('Unhandled Rejection')
    .setThumbnail(`${client.config.images}error.png`)
    .setDescription(`\`\`\`fix\n${reason.stack || JSON.stringify(reason).slice(0, 2048)}\`\`\``)
    .setColor(client.config.colors.red)
    .addField('Last message(s) received:', `List:\n${client.getLastMessages().map((message: Message, index) => `- [Message ${index + 1} | ${message.channel.type === 'DM' ? 'DM' : `<#${message.channel.id}>`}](${message.url})`).join('\n')}`, false)
    .setTimestamp()

  console.trace(reason, promise)
  channel.send({ embeds: [embed] }).catch(console.error);

  // todo : add a .txt file with the full stack trace (because embed description are limited to 2048 characters)
}