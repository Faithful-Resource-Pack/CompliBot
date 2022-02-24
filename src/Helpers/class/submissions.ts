import { magnifyAttachment } from "@functions/canvas/magnify";
import { minecraftSorter } from "@functions/minecraftSorter";
import { submissionButtonsClosed, submissionButtonsVotes, submissionsButtons } from "@helpers/buttons";
import { addMinutes } from "@helpers/dates";
import { ids, parseId } from "@helpers/emojis";
import { Client, Message, MessageEmbed } from "@src/Extended Discord";
import { DMChannel, EmbedField, MessageActionRow, MessageAttachment, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel } from "discord.js";
import axios from "axios";
import { colors } from "@helpers/colors";

export interface Votes {
  upvotes: Array<string>, 
  downvotes: Array<string>
}

// where "in" & "out" are both at the ends of the process but "in" -> go to the pack, "out" -> not enough votes
export type SubmissionStatus = "pending" | "invalid" | "instapassed" | "council" | "in" | "out";

export class Submission {
  readonly id: string;
  private messageId: string;
  private channelId: string;
  private votes: Votes;
  private status: SubmissionStatus = "pending";
  private timeout: number; // used for end of events (pending until...)

  constructor(data?: Submission) {
    // new
    if (!data) {
      this.id = new Date().getTime().toString();
      this.votes = {
        upvotes: [],
        downvotes: []
      }
      // current time + 3d
      this.setTimeout(parseInt((addMinutes(new Date(), 4320).getTime() / 1000).toFixed(0), 10));
      this.setStatus("pending");
    }

    // copy
    else {
      const s: Submission = data;
      this.id = s.id;
      this.messageId = s.messageId;
      this.channelId = s.channelId;
      this.votes = s.votes;
      this.status = s.status;
      this.timeout = s.timeout;
    }
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


  public getMessageId(): string {
    return this.messageId;
  }
  public setMessageId(message: string): this
  public setMessageId(message: Message): this 
  public setMessageId(message: any) {
    if (message.id) this.messageId = message.id; // object
    else this.messageId = message; // string
    return this;
  }

  public getChannelId(): string {
    return this.channelId;
  }
  public setChannelId(channel: string): this
  public setChannelId(channel: TextChannel): this 
  public setChannelId(channel: any) {
    if (channel.id) this.channelId = channel.id; // object
    else this.channelId = channel; // string
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
      case "instapassed":
        return `${parseId(ids.instapass)} Instapassed by %USER%`;
      case "in":
        return `${parseId(ids.upvote)} This textures will be added in a future version!`;
      case "invalid":
        return `${parseId(ids.invalid)} Invalidated by %USER%`;
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

  public async updateSubmissionMessage(client: Client, userId: string): Promise<void> {
    let channel: TextChannel;
    let message: Message;

    // waky method to turns json object to json object with methods (methods aren't saved and needs to be fetched)
    try {
      channel = await client.channels.fetch(this.getChannelId()) as any;
      message = await channel.messages.fetch(this.getMessageId());
    } catch {
      // message / channel can't be fetched
    }

    const embed: MessageEmbed = new MessageEmbed(message.embeds[0]);
    let components: Array<MessageActionRow> = message.components;

    switch (this.getStatus()) {
      case "instapassed":
        embed.setColor(colors.yellow);
        // update status
        embed.fields = embed.fields.map((field: EmbedField) => {
          field.value = field.name === "Status" ? field.value = this.getStatusUI().replace("%USER%", `<@!${userId}>`) : field.value;
          return field;
        });
        // remove until field
        embed.fields = embed.fields.filter((field: EmbedField) => field.name !== "Until");
        components = [submissionsButtons];
        break;
      
      case "invalid":
        embed.setColor(colors.red);
        embed.fields = embed.fields.map((field: EmbedField) => {
          // update status
          if (field.name === "Status") 
            field.value = field.value = this.getStatusUI().replace("%USER%", `<@!${userId}>`)
          
          // change until field for a reason field
          else if (field.name === "Until") {
            field.value = "Use `/invalidate` to set up a reason!";
            field.name = "Reason";
          }

          return field;
        })
        components = [submissionsButtons];
        break;

      default:
        break; // todo
    }

    console.log(message.attachments.values());
    await message.edit({ embeds: [embed], components: [...components] })
    return;
  }

  public async postSubmissionMessage(client: Client, baseMessage: Message, file: MessageAttachment, texture: any): Promise<void> {
    const embed = await this.makeSubmissionMessage(baseMessage, file, texture);
    const submissionMessage: Message = await baseMessage.channel.send({
      embeds: [embed],
      components: [submissionButtonsClosed, submissionButtonsVotes]
    })

    this.setChannelId(baseMessage.channel.id);
    this.setMessageId(submissionMessage);
    client.submissions.set(this.id, this);
  }

  public async makeSubmissionMessage(baseMessage: Message, file: MessageAttachment, texture: any): Promise<MessageEmbed> {
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
      .addField("Votes", this.getVotesUI().join(',\n'))
      .addField("Status", this.getStatusUI())
      .addField("Until", `<t:${this.getTimeout()}>`, true)
      .setFooter({ text: `${this.id} | ${baseMessage.author.id}` }); // used to authenticate the submitter (for message deletion)

    // add description if there is one
    if (baseMessage.content !== "" || baseMessage.content !== undefined) embed.setDescription(baseMessage.content);
    
    //* avoid message attachment to be deleted by Discord API when message is edited
    let channel: TextChannel;
    try {
      channel = await baseMessage.client.channels.fetch("946432206530826240") as any;
    } catch { return embed; } // can't fetch channel

    let url: string = "https://raw.githubusercontent.com/Compliance-Resource-Pack/App/main/resources/transparency.png";
    try {
      url = (await axios.get(`${(baseMessage.client as Client).config.apiUrl}textures/${texture.id}/url/default/${texture.paths[0].versions.sort(minecraftSorter).reverse()[0]}`)).request.res.responseUrl;
    } catch {}

    // magnified x16 texture in thumbnail
    const magnifiedAttachment = await magnifyAttachment({url: url,name: "magnified.png"})
    
    // saved attachments in a private message
    const messageAttachment = await channel.send({ files: [file, magnifiedAttachment] });
    messageAttachment.attachments.forEach((ma: MessageAttachment) => files.push(ma));

    // set submitted texture in image
    embed.setImage(files[0].url);
    embed.setThumbnail(files[1].url);

    return embed;
  }

  public async createContribution() {
    // todo: ADD CONTRIBUTION CREATION TROUGH API & COMMIT FILE TO GITHUB (ALL BRANCHES + CORRESPONDING REPO)

  }
}