import config from '@json/config.json';
import { Client } from '@client';
import express from 'express';
import bodyParser from 'body-parser';
import { success } from '@helpers/logger';
import { colors } from '@helpers/colors';
import { EndpointMessage } from '@interfaces';
import {
  MessageAttachment, MessageEmbed, TextBasedChannel, TextChannel, User,
} from 'discord.js';
import { PostMessage } from '../interfaces/endpointListen';

/**
 * Returns attachment from file
 * @param content String content of file
 * @param name file name
 * @returns {MessageAttachment} Message attachment
 */
export const fileConstructor: Function = (
  content: string,
  name: string = 'file.txt',
): MessageAttachment => {
  const buffer = Buffer.from(content, 'utf8');
  return new MessageAttachment(buffer, name);
};

/**
 * Sends error message to channel
 * @param client Discord custom client
 * @param payload Incoming message payload
 */
export const errorHandler: Function = async (client: Client, payload: EndpointMessage) => {
  await (async () => {
    // get dev log channel
    const targetChannelID = client.tokens.endpointChannel;
    let channel = client.channels.cache.get(targetChannelID) as TextChannel;
    if (channel === undefined) channel = await client.channels.fetch(targetChannelID) as TextChannel; // fetch channel if not in cache
    if (channel === undefined) return; // avoid infinite loop when crash is outside of client

    const fullContent = JSON.stringify(payload.content, null, '  ');
    let content = fullContent;
    if (fullContent.length > 4096) {
      content = JSON.stringify({
        message: payload.content.message,
        code: payload.content.code,
        stack: payload.content.stack.split('\n').map((e) => e.trim()),
      }, null, '  ');
    }

    const date = new Date().toISOString().split('T')
      .map((e, i) => (i === 1 ? e.substring(0, 8).replace(/:/g, '-') : e))
      .map((e) => e.replace(/-/g, '_'))
      .join('-');

    const filename = `endpoint-error-${date}.json`;

    const embed = new MessageEmbed()
      .setAuthor({
        name: payload.type,
        iconURL: `${client.config.images}bot/error.png`,
      })
      .setColor(colors.red)
      .setTimestamp()
      .setDescription(`\`\`\`json\n${content}\n\`\`\``)
      .setFooter({
        text: client.user.tag,
        iconURL: client.user.avatarURL(),
      });

    await channel
      .send({
        embeds: [embed],
      })
      .catch(console.error);
    await channel
      .send({
        files: [fileConstructor(fullContent, filename)],
      })
      .catch(console.error); // send after because the file is displayed before the embed (embeds are prioritized)
  })()
    .catch((final_err) => {
      // ! NEVER EVER THROW ERROR HERE, ELSE IT LOOPS
      console.error(final_err);
    });
};

export default function endpointListen(client: Client) {
  const app = express();
  const port = client.tokens.endpointPort;

  // parse application/json
  app.use(bodyParser.json());

  app.post('/', async (req, res) => {
    const payload = req.body as EndpointMessage;
    errorHandler(client, payload);
    res.status(200).end();
  });

  /**
   * Gives a way to communicate between API and Bot to send embeds to users to warn them
   * Give them updates
   */
  app.post('/send-embed', async (req, res) => {
    const payload = req.body as PostMessage;

    //* Gather users and channels
    let users: Array<string> = [];
    let channels: Array<string> = [];
    if (payload.destinations?.channels !== undefined) channels = payload.destinations?.channels;
    if (payload.destinations?.users !== undefined) users = payload.destinations?.users;
    if (payload.destinator !== '') users.push(payload.destinator);

    //* Transform channel names into channel ids
    channels = channels.map((c) => config.apiChannels[c] || c);

    //* remove duplicates after transforming channel names into ids
    users = users.filter((e, i, a) => a.indexOf(e) === i);
    channels = channels.filter((e, i, a) => a.indexOf(e) === i);

    //* Search users and channels
    const sendable = await Promise.all([
      ...users.map((u) => client.users.fetch(u)),
      ...channels.map((c) => client.channels.fetch(c)),
    ].flat()).catch((e) => new Error(JSON.stringify(e))) as (User | TextBasedChannel)[] | Error;

    if (sendable instanceof Error) {
      const {
        httpStatus, name, message, method, path, code,
      } = JSON.parse(sendable.message);
      const m = {
        name,
        message,
        method,
        path,
        code,
      };
      res.status(httpStatus).json(m).end();
      return;
    }

    //* Send Embeds
    const { embed } = payload;
    // we use allSettled because some users may have deactivated DMs
    Promise.allSettled(
      sendable.map((s) => s.send({ embeds: [embed] })),
    )
      .then((results) => {
        const total = results.length;
        const sent = results.filter((r) => r.status === 'fulfilled').length;
        const failed = total - sent;
        res.status(200).json({
          total,
          sent,
          failed,
        }).end();
      })
      .catch((e) => {
        res.status(400).json(JSON.parse(JSON.stringify(e))).end();
      });
  });

  app.listen(port, 'localhost', () => {
    console.info(`${success}Endpoint listening on port ${port}.`);
  });
}