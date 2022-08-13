import axios, { AxiosResponse } from 'axios';
import getResourcePackFromName from '@functions/getResourcePack';
import MinecraftSorter from '@helpers/sorter';
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import {
  submissionButtonsClosedEnd,
  submissionButtonsClosed,
  submissionButtonsVotes,
  submissionButtonsVotesCouncil,
} from '@helpers/buttons';
import { addMinutes } from '@helpers/dates';
import { ids, parseId } from '@helpers/emojis';
import {
  Automation, Client, Message, MessageEmbed,
} from '@client';
import {
  EmbedField,
  MessageAttachment,
  TextChannel,
} from 'discord.js';
import { colors } from '@helpers/colors';
import {
  getCorrespondingCouncilChannel, getCorrespondingGuildIdFromSubmissionChannel, getSubmissionChannelName, getSubmissionSetting,
} from 'helpers/submissionConfig';
import Stick from '@class/Stick';
import {
  Contribution,
  Path,
  Paths,
  Use,
  Uses,
  Usernames,
  Texture,
  MCMETA,
} from '@helpers/interfaces/firestorm';
import toDataURL from '@helpers/functions/toDataURL';
import { TimedEmbed } from '.';
import MCAnimation from '../MCAnimation';

export type SubmissionStatus = 'pending' | 'instapassed' | 'added' | 'no_council' | 'council' | 'denied' | 'invalid';

export interface SubmissionOptions {
  timeBeforeCouncil?: number;
  timeBeforeResults?: number;
  isCouncilEnabled?: boolean;
}

// changing those values may break previously submitted textures
const FIELD_TAGS = 'Tags';
const FIELD_CONTRIBUTORS = 'Contributor(s)';
const FIELD_RESOURCE_PACK = 'Resource Pack';
const FIELD_VOTES = 'Votes';
const FIELD_STATUS = 'Status';
const FIELD_TIME = 'Until';

export class Submission extends TimedEmbed {
  private contribution: Contribution;
  private repos: string;
  private paths: Paths;
  private uses: Uses;
  private textureBuffer: string;
  private usernames: Usernames;
  private council: boolean;
  private beforeCouncil: number;
  private beforeResults: number;

  constructor(data?: Submission, options?: SubmissionOptions) {
    super(data);

    this.beforeCouncil = options?.timeBeforeCouncil ?? data.beforeCouncil ?? 4320;
    this.beforeResults = options?.timeBeforeResults ?? data.beforeResults ?? 1440;
    this.council = options?.isCouncilEnabled ?? data.council ?? true;

    // new
    if (!data) {
      this.setTimeout(addMinutes(new Date(), this.council ? this.beforeCouncil : this.beforeResults));
    }
  }

  public isCouncilEnabled(): boolean {
    return this.council;
  }

  public getTimeBeforeCouncil(): number {
    return this.beforeCouncil;
  }

  public getTimeBeforeResults(): number {
    return this.beforeResults;
  }

  public setStatus(status: SubmissionStatus, client: Client): this {
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
        return `${parseId(ids.upvote)} This texture will be added in a future version!`;
      case 'invalid':
        return `${parseId(ids.invalid)} Invalidated by %USER%`;
      case 'denied':
        return `${parseId(ids.downvote)} This texture won't be added.`;
      case 'pending':
        return `${parseId(ids.pending)} Waiting for votes...`;
      case 'no_council':
        return `${parseId(ids.downvote)} Not enough votes to ${this.council ? 'go to council' : 'be added to the pack'}!`;
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
          if (field.name === FIELD_STATUS) field.value = this.getStatusUI();

          return field;
        });
        // remove until field
        embed.fields = embed.fields.filter((field: EmbedField) => field.name !== FIELD_TIME);
        components = [submissionButtonsClosedEnd];
        break;

      case 'council':
        embed.setColor(colors.council);
        embed.fields = embed.fields.map((field: EmbedField) => {
          if (field.name === FIELD_STATUS) field.value = this.getStatusUI();
          if (field.name === FIELD_TIME) field.value = `<t:${this.getTimeout()}>`;
          if (field.name === FIELD_VOTES) field.value = this.getTotalVotesUI();
          return field;
        });

        components = [submissionButtonsClosed, submissionButtonsVotesCouncil];
        break;

      case 'instapassed':
        embed.setColor(colors.yellow);
        // update status
        embed.fields = embed.fields.map((field: EmbedField) => {
          field.value = field.name === FIELD_STATUS
            ? (field.value = this.getStatusUI().replace('%USER%', `<@!${userId}>`))
            : field.value;
          return field;
        });
        // remove until field
        embed.fields = embed.fields.filter((field: EmbedField) => field.name !== FIELD_TIME);
        components = [submissionButtonsClosedEnd];
        break;

      case 'denied':
      case 'invalid':
        embed.setColor(this.getStatus() === 'denied' ? colors.black : colors.red);
        embed.fields = embed.fields.map((field: EmbedField) => {
          // update status
          if (field.name === FIELD_STATUS) field.value = this.getStatusUI().replace('%USER%', `<@!${userId}>`);
          // change until field for a reason field
          else if (field.name === FIELD_TIME) {
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
      field.value = field.name === FIELD_VOTES ? (field.value = this.getTotalVotesUI()) : field.value;
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
    client.submissions.set(this.id, Automation.cleanedSubmission(this));

    return submissionMessage;
  }

  public async makeSubmissionMessage(baseMessage: Message, file: MessageAttachment, texture: Texture): Promise<MessageEmbed> {
    const mentions = [
      ...new Set([...Array.from(baseMessage.mentions.users.values()), baseMessage.author].map((user) => user.id)),
    ];

    const embed = new MessageEmbed()
      .setTitle(`[#${texture.id}] ${texture.name}`)
      .setAuthor({
        iconURL: baseMessage.author.avatarURL(),
        name: baseMessage.author.username,
      })
      .addField(FIELD_TAGS, texture.tags.join(', '))
      .addField(FIELD_CONTRIBUTORS, `<@!${mentions.join('>\n<@!')}>`, true)
      .addField(
        FIELD_RESOURCE_PACK,
        `\`${getSubmissionChannelName(baseMessage.client as Client, baseMessage.channelId)}\``,
        true,
      )
      .addField(FIELD_VOTES, this.getTotalVotesUI(), true)
      .addField(FIELD_STATUS, this.getStatusUI(), true)
      .addField(FIELD_TIME, `<t:${this.getTimeout()}>`, true)
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

    let url: string = 'https://raw.githubusercontent.com/Faithful-Resource-Pack/App/main/resources/transparency.png'; // fallback img
    let mcmeta: MCMETA;
    let req: AxiosResponse<any, any>;
    try {
      req = await axios.get(`${(baseMessage.client as Client).config.apiUrl}textures/${texture.id}/url/default/${texture.paths[0].versions.sort(MinecraftSorter).reverse()[0]}`);
      url = req.request.res.responseUrl;

      req = await axios.get(`${(baseMessage.client as Client).config.apiUrl}textures/${texture.id}/mcmeta`);
      mcmeta = req.data;
    } catch {
      // do nothing
    }

    const files: { [key: string]: MessageAttachment } = {};

    // send images in a safe channel where they are stored forever
    files.thumbnail = (await channel.send({ files: [file] })).attachments.first();

    if (mcmeta.animation) {
      const sticked: Buffer = await (new Stick({ leftURL: url, rightURL: files.thumbnail.url })).getAsBuffer();
      const animated = await (new MCAnimation({
        url: toDataURL(sticked),
        mcmeta,
        sticked: true,
        stickedMargin: 10,
      }).getAsAttachment('sticked.gif'));

      files.image = (await channel.send({ files: [animated] })).attachments.first();
    } else {
      const sticked = await (new Stick({ leftURL: url, rightURL: files.thumbnail.url })).getAsAttachment('sticked.png');
      files.image = (await channel.send({ files: [sticked] })).attachments.first();
    }

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
        //! sometimes the m.embeds[0] is undefined, this is NOT a workaround
        if (m.embeds.length !== 0) {
          // collect required information to make the contribution
          const textureURL: string = m.embeds[0].thumbnail.url;
          const textureId: string = m.embeds[0].title
            .split(' ')
            .filter((el) => el.charAt(0) === '[' && el.charAt(1) === '#' && el.slice(-1) === ']')
            .map((el) => el.slice(2, el.length - 1))[0];

          const authors: Array<string> = m.embeds[0].fields
            .filter((f) => f.name === FIELD_CONTRIBUTORS)[0]
            .value.split('\n')
            .map((auth) => auth.replace('<@!', '').replace('>', ''));

          const date: number = m.createdTimestamp;
          const { resolution, slug: pack } = getResourcePackFromName(
            client,
            m.embeds[0].fields.filter((f) => f.name === FIELD_RESOURCE_PACK)[0].value.replaceAll('`', ''),
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
              .post(`${client.config.apiUrl}contributions`, contribution, {
                headers: { bot: client.tokens.apiPassword },
              })
              .then((res) => axios.get(`${client.config.apiUrl}contributions/${res.data}`))
              .then((res) => res.data),
            axios.get(`${client.config.apiUrl}textures/${textureId}/paths`).then((res) => res.data),
            axios.get(`${client.config.apiUrl}textures/${textureId}/uses`).then((res) => res.data),
            axios.get(`${client.config.apiUrl}users/names`).then((res) => res.data),
            axios.get(textureURL, { responseType: 'arraybuffer' }).then((res) => res.data),
          ]);
        }

        return [];
      })
      .then((result: [Contribution, Paths, Uses, Usernames, string]) => {
        const [contribution, paths, uses, usernames, textureBuffer] = result;
        this.contribution = contribution;
        this.repos = contribution.pack;
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
    const basePath = path.join(`${__dirname}/../../../../repos/`, this.repos);

    // get the contribution contributors usernames
    const contributorsNames = this.usernames
      .filter((u) => this.contribution.authors.includes(u.id))
      .map((u) => u.username ?? client.users.cache.get(u.id)?.username ?? u.id);

    // add contributor role to the contributors
    const guild = client.guilds.cache.get(getCorrespondingGuildIdFromSubmissionChannel(client, this.getChannelId())) ?? undefined;
    if (guild) {
      this.contribution.authors.forEach((id) => {
        guild.members.cache.get(id)?.roles.add(getSubmissionSetting(client, this.getChannelId(), 'contributor_role'));
      });
    }

    // check if the submodule has been cloned
    try {
      child_process.execSync('git submodule update --init --recursive --remote');
    } catch {
      // something went wrong F
    }

    // split & sort uses by edition (each edition has it's own repo)
    const usesByEditions: { [edition: string]: Use[] } = {};
    this.uses.forEach((use: Use): any => {
      if (usesByEditions[use.edition]) usesByEditions[use.edition].push(use);
      else usesByEditions[use.edition] = [use];
    });

    Object.keys(usesByEditions).forEach((edition: string) => {
      // Get MC version for the edition
      const usesIds = usesByEditions[edition].map((use: Use) => use.id);
      const versions = [
        ...new Set(
          this.paths
            .filter((p: Path) => usesIds.includes(p.use))
            .map((p: Path) => p.versions)
            .flat(),
        ),
      ];

      // C://Users/.../repos/<slug>/<edition> (where <slug> is the resource pack slug and <edition> is the resource pack edition)
      const repoPath = path.join(basePath, edition);

      versions.forEach((ver: string) => {
        try {
          child_process.execSync(`cd "${repoPath}" && git stash`);
          child_process.execSync(`cd "${repoPath}" && git checkout ${ver}`);
          child_process.execSync(`cd "${repoPath}" && git pull`);
        } catch (e) {
          // something went wrong
        }

        this.paths.filter((p: Path) => p.versions.includes(ver)).forEach((p: Path) => {
          const use: Use = this.uses.find((u: Use) => u.id === p.use);
          const texturePath = path.join(repoPath, `${use.assets !== null ? `assets/${use.assets}/${p.name}` : p.name}`);
          const directories = texturePath.split('\\').slice(0, -1).join('\\');

          // create full path to the texture if it doesn't exist already
          if (!fs.existsSync(directories)) {
            fs.mkdirSync(directories, { recursive: true });
          }

          // write the texture to the path
          fs.writeFileSync(texturePath, Buffer.from(this.textureBuffer));

          // track files
          child_process.execSync(`cd "${repoPath}" && git add *`);

          // commit the changes
          child_process.execSync(`cd "${repoPath}" && git commit -m "[#${this.contribution.texture}] - Authors: ${contributorsNames.join(', ')}"`);

          // push the changes
          child_process.execSync(`cd "${repoPath}" && git push`);
        });
      });
    });
  }
}
