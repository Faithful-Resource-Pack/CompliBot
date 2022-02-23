import { magnifyAttachment } from "@functions/canvas/magnify";
import { minecraftSorter } from "@functions/minecraftSorter";
import { submissionButtonsClosed, submissionButtonsVotes } from "@helpers/buttons";
import { addMinutes } from "@helpers/dates";
import { ids, parseId } from "@helpers/emojis";
import { Client, Message, MessageEmbed } from "@src/Extended Discord";
import { MessageAttachment } from "discord.js";
import axios from "axios";

export interface Votes {
  upvotes: Array<string>, 
  downvotes: Array<string>
}

// where "in" & "out" are both at the ends of the process but "in" -> go to the pack, "out" -> not enough votes
export type SubmissionStatus = "pending" | "invalid" | "instapass" | "council" | "in" | "out";

export class Submission {
  readonly id: string;
  private message: Message;
  private votes: Votes;
  private status: SubmissionStatus = "pending";
  private timeout: number; // used for end of events (pending until...)

  constructor() {
    this.id = new Date().getTime().toString();
    this.votes = {
      upvotes: [],
      downvotes: []
    }
    // current time + 3d
    this.setTimeout(parseInt((addMinutes(new Date(), 4320).getTime() / 1000).toFixed(0), 10))
  }

  public getVotes(): [number, number] {
    return [this.votes.upvotes.length, this.votes.downvotes.length];
  }
  public getVotesUI(): [string, string] {
    let [u, d] = this.getVotes();
    return [
      `${parseId(ids.upvote)} ${u} Upvotes`,
      `${parseId(ids.downvote)} ${d} Downvotes`,
    ]
    
  }

  public addUpvote(id: string): this { return this.addVote("upvotes", id); }
  public addDownvote(id: string): this { return this.addVote("downvotes", id); }
  private addVote(type: string, id: string): this {
    // the user can only vote for one side
    if (this.votes.upvotes.includes(id)) this.removeUpvote(id);
    if (this.votes.downvotes.includes(id)) this.removeDownvote(id);
    
    this.votes[type].push(id);

    return this;
  }

  public removeUpvote(id: string): this { return this.removeVote("upvote", id); }
  public removeDownvote(id: string): this { return this.removeVote("downvote", id); }
  private removeVote(type: string, id: string): this {
    if (this.votes[type].includes(id)) this.votes[type].splice(this.votes[type].indexOf(id), 1);
    return this;
  }

  public getMessage(): Message {
    return this.message;
  }
  public setMessage(message: Message): this {
    this.message = message;
    return this;
  }

  public getStatus(): SubmissionStatus {
    return this.status;
  }
  public setStatus(status: SubmissionStatus): this {
    this.status = status;
    return this;
  }

  public getStatusUI(): string {
    switch (this.getStatus()) {
      case "council":
        return `${parseId(ids.pending)} Waiting for council votes...`;
      case "instapass":
        return `${parseId(ids.instapass)} Instapassed by %USER%`;
      case "in":
        return `${parseId(ids.upvote)} This textures will be added in a future version!`;
      case "invalid":
        return `${parseId(ids.upvote)} Invalidated by %USER%`;
      case "out": 
        return `${parseId(ids.downvote)} This texture won't be added.`
      case "pending":
        return `${parseId(ids.pending)} Waiting for votes...`
      default:
        return "Unknown status"
    }
  }

  public getTimeout(): number {
    return this.timeout;
  }
  public setTimeout(timeout: number): this {
    this.timeout = timeout;
    return this;
  }

  public async postSubmissionMessage(client: Client, baseMessage: Message, file: MessageAttachment, texture: any): Promise<void> {
    const [embed, files] = await this.makeSubmissionMessage(baseMessage, file, texture);
    const submissionMessage: Message = await baseMessage.channel.send({
      embeds: [embed],
      files: [...files],
      components: [submissionButtonsClosed, submissionButtonsVotes]
    })

    this.setMessage(submissionMessage);
    client.submissions.set(this.id, this);

    return;
  }

  public async makeSubmissionMessage(baseMessage: Message, file: MessageAttachment, texture: any): Promise<[MessageEmbed, Array<MessageAttachment>]> {
    const files: Array<MessageAttachment> = [];
    const mentions = [
      ...new Set([...Array.from(baseMessage.mentions.users.values()), baseMessage.author].map((user) => user.id)),
    ];
    
    const embed = new MessageEmbed()
      .setTitle(`[#${texture.id}] ${texture.name}`)
      .setAuthor({ iconURL: baseMessage.author.avatarURL(), name: baseMessage.author.username })
      .addField("Tags", texture.tags.join(', '))
      .addField("Contributor(s)", `<@!${mentions.join(">\n<@!")}>`, true)
      .addField(
        "Resource Pack",
        `\`${Object.keys((baseMessage.client as Client).config.submitChannels).filter((key) => (baseMessage.client as Client).config.submitChannels[key] === baseMessage.channel.id)[0]}\``,
        true,
      )
      .addField("Status", this.getStatusUI())
      .addField("Until", `<t:${this.getTimeout()}>`, true)
      .addField("Votes", this.getVotesUI().join(',\n'))
      .setThumbnail("attachment://magnified.png")
      .setFooter({ text: `${this.id} | ${baseMessage.author.id}` }); // used to authenticate the submitter (for message deletion)

    // add description if there is one
    if (baseMessage.content !== "" || baseMessage.content !== undefined) embed.setDescription(baseMessage.content);
    
    if (file.url) embed.setImage(file.url);
    else {
      embed.setImage(`attachment://${file.name}`);
      files.push(file);
    }

    files.push(
      await magnifyAttachment({
        url: (
          await axios.get(
            `${(baseMessage.client as Client).config.apiUrl}textures/${texture.id}/url/default/${
              texture.paths[0].versions.sort(minecraftSorter).reverse()[0]
            }`,
          )
        ).request.res.responseUrl,
        name: "magnified.png",
      }),
    );  

    return [embed, files];
  }
}