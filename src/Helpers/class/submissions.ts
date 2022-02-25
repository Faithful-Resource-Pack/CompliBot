import { magnifyAttachment } from "@functions/canvas/magnify";
import { minecraftSorter } from "@functions/minecraftSorter";
import { submissionButtonsClosed, submissionButtonsVotes, submissionButtonsVotesCouncil, submissionsButtons } from "@helpers/buttons";
import { addMinutes } from "@helpers/dates";
import { ids, parseId } from "@helpers/emojis";
import { Client, Message, MessageEmbed } from "@src/Extended Discord";
import { AnyChannel, DMChannel, EmbedField, MessageActionRow, MessageAttachment, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel } from "discord.js";
import axios from "axios";
import { colors } from "@helpers/colors";

export type VotesT = "upvote" | "downvote";
export type Votes = {
  [key in VotesT]: Array<string>;
};

// where "in" & "out" are both at the ends of the process but "in" -> go to the pack, "out" -> not enough votes
export type SubmissionStatusCouncilPing = "council" | "denied" | "invalid";
export type SubmissionStatus = "pending" | "instapassed" | "added" | "no_council" | SubmissionStatusCouncilPing;

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
        upvote: [],
        downvote: []
      }
      // current time + 3d
      // this.setTimeout(addMinutes(new Date(), 4320));
      this.setTimeout(addMinutes(new Date(), 1));
      this.status = "pending";
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
    return [this.votes.upvote.length, this.votes.downvote.length];
  }
  public getVotesUI(): [string, string] {
    let [u, d] = this.getVotes();
    return [
      `${parseId(ids.upvote)} ${u} Upvote${u > 1 ? "s" : ""}`,
      `${parseId(ids.downvote)} ${d} Downvote${d > 1 ? "s" : ""}`,
    ]
    
  }

  public addUpvote(id: string): this { return this.addVote("upvote", id); }
  public addDownvote(id: string): this { return this.addVote("downvote", id); }
  private addVote(type: VotesT, id: string): this {
    // the user can only vote for one side
    if (this.votes.upvote.includes(id)) this.removeUpvote(id);
    if (this.votes.downvote.includes(id)) this.removeDownvote(id);
    
    this.votes[type].push(id);

    return this;
  }

  public removeUpvote(id: string): this { return this.removeVote("upvote", id); }
  public removeDownvote(id: string): this { return this.removeVote("downvote", id); }
  private removeVote(type: VotesT, id: string): this {
    if (this.votes[type].includes(id)) this.votes[type].splice(this.votes[type].indexOf(id), 1);
    return this;
  }

  public voidVotes(): this {
    this.votes = {
      upvote: [],
      downvote: []
    }
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
  public setStatus(status: SubmissionStatus, client: Client): this {
    this.status = status;

    let channel: TextChannel;

    // send message to inform council members
    switch (status) {
      case "council":
      case "denied":
      case "invalid":
        client.channels.fetch(Object.values(client.config.submissions).filter(c => c.submit === this.channelId)[0].council)
          .then((channel: TextChannel) => {
            const embed: MessageEmbed = new MessageEmbed()
              .setTitle(`A texture is ${status === "council" ? `in ${status}` : status}`)
              .setDescription(`[Submission](https://discord.com/channels/${channel.guildId}/${this.channelId}/${this.messageId})\n${
                status === "council" ? "Please, proceed to vote!" : `Please, give a reason for the ${status === "denied" ? "deny" : "invalidation"}.`
              }`)

            channel.send({ embeds: [embed] })
              .then((message: Message) => {
                if (status === "council") message.startThread({ name: "Debate about that texture!" });
              })
          })
          .catch(null); // channel can't be fetched
        
        break;
        
      default:
        break;
    }


    return this;
  }

  public getStatusUI(): string {
    switch (this.getStatus()) {
      case "council":
        return `${parseId(ids.pending)} Waiting for council votes...`;
      case "instapassed":
        return `${parseId(ids.instapass)} Instapassed by %USER%`;
      case "added":
        return `${parseId(ids.upvote)} This textures will be added in a future version!`;
      case "invalid":
        return `${parseId(ids.invalid)} Invalidated by %USER%`;
      case "denied": 
        return `${parseId(ids.downvote)} This texture won't be added.`
      case "pending":
        return `${parseId(ids.pending)} Waiting for votes...`
      case "no_council":
        return `${parseId(ids.downvote)} Not enough votes to go to council!`
      default:
        return "Unknown status"
    }
  }

  public isTimeout(): boolean {
    if (this.getTimeout() < (new Date().getTime() / 1000)) return true;
    return false;
  }

  public getTimeout(): number {
    return this.timeout;
  }
  public setTimeout(date: Date): this {
    this.timeout = parseInt((date.getTime() / 1000).toFixed(0));
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
      case "no_council":
      case "added":
        embed.setColor(this.getStatus() === "added" ? colors.green : colors.black);
        embed.fields = embed.fields.map((field: EmbedField) => {
          if (field.name === "Status")
            field.value = this.getStatusUI();

          return field
        });
        // remove until field
        embed.fields = embed.fields.filter((field: EmbedField) => field.name !== "Until");
        components = [submissionsButtons];
        break;

      case "council":

        embed.setColor(colors.council);
        embed.fields = embed.fields.map((field: EmbedField) => {
          if (field.name === "Status") field.value = this.getStatusUI();
          if (field.name === "Until") field.value = `<t:${this.getTimeout()}>`;
          if (field.name === "Votes") field.value =  this.getVotesUI().join(',\n');
          return field;
        })

        components = [submissionButtonsClosed, submissionButtonsVotesCouncil];
        break;

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
      
      case "denied":
      case "invalid":
        embed.setColor(this.getStatus() === "denied" ? colors.black : colors.red);
        embed.fields = embed.fields.map((field: EmbedField) => {
          // update status
          if (field.name === "Status") 
            field.value = this.getStatusUI().replace("%USER%", `<@!${userId}>`);
          
          // change until field for a reason field
          else if (field.name === "Until") {
            field.value = "Use `/reason` to set up a reason!";
            field.name = "Reason";
          }

          return field;
        })
        components = [submissionsButtons];
        break;

      case "pending":
      default:
        break; // nothing
    }

    // always update votes
    embed.fields = embed.fields.map((field: EmbedField) => {
      field.value = field.name === "Votes" ? field.value =  this.getVotesUI().join(',\n') : field.value;
      return field;
    })
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
        `\`${Object.keys((baseMessage.client as Client).config.submissions).filter((pack) => (baseMessage.client as Client).config.submissions[pack].submit === baseMessage.channel.id)[0]}\``,
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