import { Message } from "@src/Extended Discord";

export interface Votes {
  upvotes: Array<string>, 
  downvotes: Array<string>
}

export class Submission {
  readonly id: string;
  private message: Message;
  private votes: Votes;

  constructor() {
    this.id = new Date().getTime().toString();
    this.votes = {
      upvotes: [],
      downvotes: []
    }
  }

  public addUpvote(id: string): this { return this.addVote("upvotes", id); }
  public addDownvote(id: string): this { return this.addVote("downvotes", id); }
  private addVote(type: string, id: string): this {
    if (!this.votes[type].includes(id)) this.votes[type].push(id);
    return this;
  }

  public removeUpvote(id: string): this { return this.removeVote("upvote", id); }
  public removeDownvote(id: string): this { return this.removeVote("downvote", id); }
  private removeVote(type: string, id: string): this {
    if (this.votes[type].includes(id)) this.votes[type].splice(this.votes[type].indexOf(id), 1);
    return this;
  }

  public getVotes(): [number, number] {
    return [this.votes.upvotes.length, this.votes.downvotes.length];
  }

  public setMessage(message: Message): this {
    this.message = message;
    return this;
  }

  public getMessage(): Message {
    return this.message;
  }
}