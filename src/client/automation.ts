import { Poll } from '@class/TimedEmbed/Poll';
import { Submission } from '@class/TimedEmbed/Submission';
import { addMinutes } from '@helpers/dates';
import { ids, parseId } from '@helpers/emojis';
import { Client, MessageEmbed } from '@client';
import { Message, TextChannel, User } from 'discord.js';

export default class Automation {
  private ticking: boolean = true;

  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public pause() {
    this.ticking = !this.ticking;
  }

  public start() {
    setInterval(() => {
      if (!this.ticking) return;

      // submissions check:
      this.client.submissions.each((s: Submission) => this.submissionCheck(s));

      // polls check:
      this.client.polls.each((p: Poll) => this.pollCheck(p));
    }, 1000); // each second
  }

  private pollCheck(p: Poll): void {
    const poll = new Poll(p); // get methods back

    if (poll.isTimedOut()) {
      poll.setStatus('ended');
      poll.updateEmbed(this.client).then(() => this.client.polls.delete(poll.id));
    }
  }

  private submissionSendVotes(submission: Submission, votes: [number, number]): void {
    const [upvoters, downvoters] = submission.getVotes();
    let channel: TextChannel;
    let message: Message;

    this.client.channels
      .fetch(submission.getChannelId())
      .then((c: TextChannel) => {
        channel = c;
        return c.messages.fetch(submission.getMessageId());
      })
      .then((m: Message) => {
        message = m;
        return m.embeds[0].footer.text.split(' | ')[1];
      })
      .then((userID: string) => this.client.users.fetch(userID))
      .then((user: User) => {
        const embed = new MessageEmbed()
          .setTitle('Votes for your submission')
          .setURL(`https://discord.com/channels/${channel.guildId}/${channel.id}/${message.id}`)
          .addFields(
            {
              name: 'Upvotes',
              value: `${parseId(ids.upvote)} ${votes[0] > 0 ? `<@!${upvoters.join('>,\n<@!')}>` : 'None'}`,
            },
            {
              name: 'Downvotes',
              value: `${parseId(ids.downvote)} ${votes[1] > 0 ? `<@!${downvoters.join('>,\n<@!')}>` : 'None'}`,
            },
          );

        user.send({ embeds: [embed] }).catch(null); // DM closed
        return user.id;
      })
      .then((userId: string) => submission.updateSubmissionMessage(this.client, userId))
      .catch(null);
  }

  private submissionCheck(s: Submission): void {
    const submission = new Submission(s); // get methods back

    // if it's time to check the submission
    if (submission.isTimedOut()) {
      const [up, down] = submission.getVotesCount();

      // remove submission from bot data after 1 month
      const t = new Date();
      t.setMonth(t.getMonth() - 1);
      if (+(t.getTime() / 1000).toFixed(0) > submission.getTimeout()) {
        this.client.submissions.delete(submission.id);
        return; // we don't needs to continue this iteration
      }

      switch (submission.getStatus()) {
        case 'pending':
          // check votes
          if (up >= down) {
            if (submission.isCouncilEnabled()) {
              submission.setStatus('council', this.client);
              submission.setTimeout(addMinutes(new Date(), submission.getTimeBeforeResults())); // now + delay
            } else {
              submission.setStatus('added', this.client);
              submission.createContribution(this.client);
            }
          } else {
            submission.setStatus('no_council', this.client);
          }

          // save the modification
          this.client.submissions.set(submission.id, submission);

          // sends people that have voted to the submitter
          this.submissionSendVotes(submission, [up, down]);
          break;

        case 'council':
          if (up > down) submission.setStatus('added', this.client).createContribution(this.client);
          else submission.setStatus('denied', this.client);

          this.client.submissions.set(submission.id, submission);

          // sends people that have voted to the submitter
          this.submissionSendVotes(submission, [up, down]);
          break;

        default:
          break;
      }
    }
  }
}
