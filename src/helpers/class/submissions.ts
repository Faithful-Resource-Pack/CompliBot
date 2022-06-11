import axios from 'axios';
import getResourcePackFromName from '@functions/getResourcePack';
import MinecraftSorter from '@helpers/sorter';
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import { info, warning } from '@helpers/logger';
import {
  submissionButtonsClosedEnd,
  submissionButtonsClosed,
  submissionButtonsVotes,
  submissionButtonsVotesCouncil,
} from '@helpers/buttons';
import { addMinutes } from '@helpers/dates';
import { ids, parseId } from '@helpers/emojis';
import { Client, Message, MessageEmbed } from '@client';
import {
  EmbedField,
  MessageAttachment,
  TextChannel,
} from 'discord.js';
import { colors } from '@helpers/colors';
import { getCorrespondingCouncilChannel, getSubmissionChannelName } from '@helpers/channels';
import { stickAttachment } from '@functions/canvas/stick';
import {
  Contribution,
  Path,
  Paths,
  Use,
  Uses,
  Usernames,
  Repos,
  AllRepos,
} from '@helpers/interfaces/firestorm';
import { TimedEmbed } from './timedEmbed';

export type SubmissionStatus = 'pending' | 'instapassed' | 'added' | 'no_council' | 'council' | 'denied' | 'invalid';

export class Submission extends TimedEmbed {
  // changing those values may break previously submitted textures
  private readonly FIELD_TAGS = 'Tags';
  private readonly FIELD_CONTRIBUTORS = 'Contributor(s)';
  private readonly FIELD_RESOURCE_PACK = 'Resource Pack';
  private readonly FIELD_VOTES = 'Votes';
  private readonly FIELD_STATUS = 'Status';
  private readonly FIELD_TIME = 'Until';
  private contribution: Contribution;
  private repos: Repos;
  private paths: Paths;
  private uses: Uses;
  private textureBuffer: string;
  private usernames: Usernames;

  constructor(data?: Submission) {
    super(data);

    // new
    if (!data) {
      this.setTimeout(addMinutes(new Date(), 4320));
    }
    // if (!data) this.setTimeout(addMinutes(new Date(), 1)); // for dev
  }

  public setStatus(status: string, client: Client): this {
    super.setStatus(status);

    // send message to inform council members
    switch (status) {
      case 'council':
      case 'denied':
      case 'invalid':
        client.channels
          .fetch(getCorrespondingCouncilChannel(client, this.getChannelId()))
          .then((channel: TextChannel) => {
            const [up, down] = this.getVotesCount();
            const [upvoters, downvoters] = this.getVotes();

            const embed: MessageEmbed = new MessageEmbed()
              .setTitle(`A texture is ${status === 'council' ? `in ${status}` : status}`)
              .setURL(`https://discord.com/channels/${channel.guildId}/${this.getChannelId()}/${this.getMessageId()}`)
              .setDescription(
                `${
                  status === 'council'
                    ? 'Please, vote here!'
                    : `Please, give a reason for ${status === 'denied' ? 'denying' : 'invalidating'} the texture.`
                }`,
              );

            if (status === 'council') {
              embed.addFields(
                {
                  name: 'Upvotes',
                  value: `${parseId(ids.upvote)} ${up > 0 ? `<@!${upvoters.join('>,\n<@!')}>` : 'None'}`,
                },
                {
                  name: 'Downvotes',
                  value: `${parseId(ids.downvote)} ${down > 0 ? `<@!${downvoters.join('>,\n<@!')}>` : 'None'}`,
                },
              );
            }

            channel
              .send({
                embeds: [embed],
              })
              .then((message: Message) => {
                if (status === 'council') {
                  message.startThread({
                    name: 'Debate about that texture!',
                  });
                }
              });

            this.voidVotes();
          })
          .catch(null); // channel can't be fetched
        break;

      default:
        break;
    }

    return this;
  }

  public getTotalVotesUI(): string {
    const c = this.getTotalVotes();
    if (c === 0) return 'Nobody voted yet!';
    return `${c} ${c === 1 ? 'person' : 'people'} voted`;
  }

  public getStatusUI(): string {
    switch (this.getStatus()) {
      case 'council':
        return `${parseId(ids.pending)} Waiting for council votes...`;
      case 'instapassed':
        return `${parseId(ids.instapass)} Instapassed by %USER%`;
      case 'added':
        return `${parseId(ids.upvote)} This textures will be added in a future version!`;
      case 'invalid':
        return `${parseId(ids.invalid)} Invalidated by %USER%`;
      case 'denied':
        return `${parseId(ids.downvote)} This texture won't be added.`;
      case 'pending':
        return `${parseId(ids.pending)} Waiting for votes...`;
      case 'no_council':
        return `${parseId(ids.downvote)} Not enough votes to go to council!`;
      default:
        return super.getStatusUI();
    }
  }

  public async updateSubmissionMessage(client: Client, userId: string): Promise<void> {
    let channel: TextChannel;
    let message: Message;

    // wacky method to turns json object to json object with methods (methods aren't saved and needs to be fetched)
    try {
      channel = (await client.channels.fetch(this.getChannelId())) as any;
      message = await channel.messages.fetch(this.getMessageId());
    } catch {
      // message / channel can't be fetched
      return;
    }

    const embed: MessageEmbed = new MessageEmbed(message.embeds.shift()); // remove first embed (with description) & keep others with magnified imgs
    let { components } = message;

    switch (this.getStatus()) {
      case 'no_council':
      case 'added':
        embed.setColor(this.getStatus() === 'added' ? colors.green : colors.black);
        embed.fields = embed.fields.map((field: EmbedField) => {
          if (field.name === this.FIELD_STATUS) field.value = this.getStatusUI();

          return field;
        });
        // remove until field
        embed.fields = embed.fields.filter((field: EmbedField) => field.name !== this.FIELD_TIME);
        components = [submissionButtonsClosedEnd];
        break;

      case 'council':
        embed.setColor(colors.council);
        embed.fields = embed.fields.map((field: EmbedField) => {
          if (field.name === this.FIELD_STATUS) field.value = this.getStatusUI();
          if (field.name === this.FIELD_TIME) field.value = `<t:${this.getTimeout()}>`;
          if (field.name === this.FIELD_VOTES) field.value = this.getTotalVotesUI();
          return field;
        });

        components = [submissionButtonsClosed, submissionButtonsVotesCouncil];
        break;

      case 'instapassed':
        embed.setColor(colors.yellow);
        // update status
        embed.fields = embed.fields.map((field: EmbedField) => {
          field.value = field.name === this.FIELD_STATUS
            ? (field.value = this.getStatusUI().replace('%USER%', `<@!${userId}>`))
            : field.value;
          return field;
        });
        // remove until field
        embed.fields = embed.fields.filter((field: EmbedField) => field.name !== this.FIELD_TIME);
        components = [submissionButtonsClosedEnd];
        break;

      case 'denied':
      case 'invalid':
        embed.setColor(this.getStatus() === 'denied' ? colors.black : colors.red);
        embed.fields = embed.fields.map((field: EmbedField) => {
          // update status
          if (field.name === this.FIELD_STATUS) field.value = this.getStatusUI().replace('%USER%', `<@!${userId}>`);
          // change until field for a reason field
          else if (field.name === this.FIELD_TIME) {
            field.value = 'Use `/reason` to set up a reason!';
            field.name = 'Reason';
          }

          return field;
        });
        components = [submissionButtonsClosedEnd];
        break;

      case 'pending':
      default:
        break; // nothing
    }

    // always update votes
    embed.fields = embed.fields.map((field: EmbedField) => {
      field.value = field.name === this.FIELD_VOTES ? (field.value = this.getTotalVotesUI()) : field.value;
      return field;
    });
    await message.edit({
      embeds: [embed, ...message.embeds],
      components: [...components],
    });
  }

  public async postSubmissionMessage(
    client: Client,
    baseMessage: Message,
    file: MessageAttachment,
    texture: any,
  ): Promise<Message> {
    const submissionMessage: Message = await baseMessage.channel.send({
      embeds: [await this.makeSubmissionMessage(baseMessage, file, texture)],
      components: [submissionButtonsClosed, submissionButtonsVotes],
    });

    this.setChannelId(baseMessage.channel.id);
    this.setMessageId(submissionMessage);
    client.submissions.set(this.id, this);

    return submissionMessage;
  }

  public async makeSubmissionMessage(baseMessage: Message, file: MessageAttachment, texture: any): Promise<MessageEmbed> {
    const mentions = [
      ...new Set([...Array.from(baseMessage.mentions.users.values()), baseMessage.author].map((user) => user.id)),
    ];

    const embed = new MessageEmbed()
      .setTitle(`[#${texture.id}] ${texture.name}`)
      .setAuthor({
        iconURL: baseMessage.author.avatarURL(),
        name: baseMessage.author.username,
      })
      .addField(this.FIELD_TAGS, texture.tags.join(', '))
      .addField(this.FIELD_CONTRIBUTORS, `<@!${mentions.join('>\n<@!')}>`, true)
      .addField(
        this.FIELD_RESOURCE_PACK,
        `\`${getSubmissionChannelName(baseMessage.client as Client, baseMessage.channelId)}\``,
        true,
      )
      .addField(this.FIELD_VOTES, this.getTotalVotesUI(), true)
      .addField(this.FIELD_STATUS, this.getStatusUI(), true)
      .addField(this.FIELD_TIME, `<t:${this.getTimeout()}>`, true)
      .setFooter({
        text: `${this.id} | ${baseMessage.author.id}`,
      }); // used to authenticate the submitter (for message deletion)

    // add description if there is one
    if (baseMessage.content !== '' || baseMessage.content !== undefined) embed.setDescription(baseMessage.content);

    //* avoid message attachment to be deleted by Discord API when message is edited
    let channel: TextChannel;
    try {
      channel = (await baseMessage.client.channels.fetch('946432206530826240')) as any;
    } catch {
      return embed;
    } // can't fetch channel

    let url: string = 'https://raw.githubusercontent.com/Faithful-Resource-Pack/App/main/resources/transparency.png';
    try {
      url = (
        await axios.get(
          `${(baseMessage.client as Client).config.apiUrl}textures/${texture.id}/url/default/${
            texture.paths[0].versions.sort(MinecraftSorter).reverse()[0]
          }`,
        )
      ).request.res.responseUrl;
    } catch {
      // do nothing
    }

    const files: { [key: string]: MessageAttachment } = {};

    // send images in a safe channel where they are stored forever
    files.thumbnail = (
      await channel.send({
        files: [file],
      })
    ).attachments.first();
    files.image = (
      await channel.send({
        files: [await stickAttachment({ leftURL: url, rightURL: files.thumbnail.url, name: 'sticked.png' })],
      })
    ).attachments.first();

    embed
      .setThumbnail(files.thumbnail.url)
      .setImage(files.image.url);

    return embed;
  }

  public async createContribution(client: Client) {
    client.channels
      .fetch(this.getChannelId())
      .then((c: TextChannel) => c.messages.fetch(this.getMessageId())) // get the submission message
      .then((m: Message) => {
        // collect required information to make the contribution
        const textureURL: string = m.embeds[0].thumbnail.url;
        const textureId: string = m.embeds[0].title
          .split(' ')
          .filter((el) => el.charAt(0) === '[' && el.charAt(1) === '#' && el.slice(-1) === ']')
          .map((el) => el.slice(2, el.length - 1))[0];

        const authors: Array<string> = m.embeds[0].fields
          .filter((f) => f.name === this.FIELD_CONTRIBUTORS)[0]
          .value.split('\n')
          .map((auth) => auth.replace('<@!', '').replace('>', ''));

        const date: number = m.createdTimestamp;
        const { resolution, slug: pack } = getResourcePackFromName(
          client,
          m.embeds[0].fields.filter((f) => f.name === this.FIELD_RESOURCE_PACK)[0].value.replaceAll('`', ''),
        );

        interface ContributionSubmit extends Omit<Contribution, 'id' | 'pack'> {
          pack: string;
        }

        const contribution: ContributionSubmit = {
          date,
          pack,
          resolution,
          authors,
          texture: textureId,
        };

        return Promise.all([
          axios
            .post(`${client.config.apiUrl}contributions`, contribution, { headers: { bot: client.tokens.apiPassword } })
            .then((res) => res.data),
          axios.get(`${client.config.apiUrl}settings/repositories.git`).then((res) => res.data),
          axios.get(`${client.config.apiUrl}textures/${textureId}/paths`).then((res) => res.data),
          axios.get(`${client.config.apiUrl}textures/${textureId}/uses`).then((res) => res.data),
          axios.get(`${client.config.apiUrl}users/names`).then((res) => res.data),
          axios.get(textureURL, { responseType: 'arraybuffer' }).then((res) => res.data),
        ]);
      })
      .then((result: [Contribution, AllRepos, Paths, Uses, Usernames, string]) => {
        const [contribution, repos, paths, uses, usernames, textureBuffer] = result;
        this.contribution = contribution;
        this.repos = repos[contribution.pack];
        this.paths = paths;
        this.uses = uses;
        this.usernames = usernames;
        this.textureBuffer = textureBuffer;

        this.pushTextureToGitHub(client);
      })
      .catch(console.error);
  }

  public pushTextureToGitHub(client: Client): void {
    // get the base paths where repos are located
    const basePath = path.join(`${__dirname}/../../../repos/`);
    // sort the uses by their edition
    const usesByEditions: { [edition: string]: Use[] } = {};
    // get the contribution contributors usernames
    const contributorsNames = this.contribution.authors.map(
      (id) => this.usernames.filter((user) => user.id === id)[0].username,
    );

    // if base path does not exist, create it
    if (!fs.existsSync(basePath)) fs.mkdirSync(basePath);

    // split uses by edition (each edition has it's own repo)
    this.uses.forEach((use: Use) => {
      if (usesByEditions[use.edition]) usesByEditions[use.edition].push(use);
      else usesByEditions[use.edition] = [use];
    });

    // for each edition (since each edition has it's own repo)
    Object.keys(usesByEditions).forEach((edition: string) => {
      // get all uses Ids for that edition
      const usesIds = usesByEditions[edition].map((use: Use) => use.id);

      // get all versions for those uses
      const versions = [
        ...new Set(
          this.paths
            .filter((p: Path) => usesIds.includes(p.use))
            .map((p: Path) => p.versions)
            .flat(),
        ),
      ];

      // find the corresponding repo for this use
      const repoGit: string = this.repos[edition];

      if (!repoGit) return; // if no repo found, skip this edition
      const repoName: string = this.repos[edition].split('/').pop().replace('.git', '');

      // C://Users/.../repos/repoName
      const fullPath: string = path.join(basePath, repoName);

      // if repo does not exist, clone it
      // else stash & pull the latest version
      if (!fs.existsSync(fullPath)) {
        if (client.verbose) console.log(`${warning} Cloning ${repoName}`);
        child_process.execSync(`cd "${basePath}" && git clone ${repoGit}`);
      } else child_process.execSync(`cd "${fullPath}" && git stash && git pull`);

      // for each versions, write the texture to all paths that has that version
      versions.forEach((version: string) => {
        // swap to the right version branch
        try {
          child_process.execSync(`cd "${fullPath}" && git checkout ${version}`);
        } catch (e) {
          /* already on branch */
        }

        // stash changes & pull latest
        try {
          child_process.execSync(`cd "${fullPath}" && git stash`);
        } catch (e) {
          /* no changes to stash */
        }
        // update repo to latest version
        try {
          child_process.execSync(`cd "${fullPath}" && git pull`);
        } catch (e) {
          /* already up to date */
        }

        // for each path for that version
        this.paths
          .filter((p: Path) => p.versions.includes(version))
          .forEach((p: Path) => {
            const use: Use = this.uses.find((u: Use) => u.id === p.use);
            const texturePath = path.join(
              basePath,
              repoName,
              `${use.assets !== null ? `assets/${use.assets}/${p.name}` : p.name}`,
            );
            const directoriesUntilTexture = texturePath.split('/').slice(0, -1).join('/');

            // create full path to the texture if it doesn't exist
            if (!fs.existsSync(directoriesUntilTexture)) {
              fs.mkdirSync(directoriesUntilTexture, { recursive: true });
            }

            // upload the file
            fs.writeFileSync(texturePath, Buffer.from(this.textureBuffer));
          });

        // track files
        try {
          child_process.execSync(`cd "${fullPath}" && git add *`);
        } catch (e) {
          /* all files are already added */
        }

        // commit the changes
        try {
          child_process.execSync(
            `cd "${fullPath}" && git commit -m "[#${this.contribution.texture}] by: ${contributorsNames.join(', ')}"`,
          );
        } catch (e) {
          /* make commit */
        }

        // push the commit
        try {
          child_process.execSync(`cd "${fullPath}" && git push origin ${version}`);
        } catch (e) {
          /* push commits */
        }

        if (client.verbose) console.log(`${info}[${repoName}] ${version} pushed: #${this.contribution.texture}`);
      });
    });
  }
}
