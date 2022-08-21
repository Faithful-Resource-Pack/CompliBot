import { IModal } from '@interfaces';
import { EmbedBuilder } from '@overrides';
import { octokit, Strings, templateLoad } from '@utils';
import { ModalSubmitInteraction, CacheType } from 'discord.js';

export default {
  id: 'feedback-bug',
  run: async (interaction: ModalSubmitInteraction<CacheType>) => {
    const title = interaction.fields.getTextInputValue('feedback-input-bug-title');
    const description = interaction.fields.getTextInputValue('feedback-input-bug-what-happened');
    const steps = interaction.fields.getTextInputValue('feedback-input-bug-reproduce');
    const screenshots = interaction.fields.getTextInputValue('feedback-input-bug-screenshots');
    const notes = interaction.fields.getTextInputValue('feedback-input-bug-notes');

    const template = templateLoad('feedbackBug.md')
      .replace('%WHAT_HAPPENED%', description)
      .replace('%TO_REPRODUCE%', steps)
      .replace('%SCREENSHOTS%', screenshots.length ? screenshots : '__No response__')
      .replace('%NOTES%', notes.length ? notes : '__No response__');

    const footer = templateLoad('feedbackFooter.html')
      .replace('%USER_AVATAR%', interaction.user.displayAvatarURL())
      .replace('%USER_ID%', interaction.user.id)
      .replace('%USER_NAME%', interaction.user.username);

    const response = await octokit.request('POST /repos/{owner}/{repo}/issues', {
      owner: 'Faithful-Resource-Pack',
      repo: 'Discord-Bot',
      title: `[Bug] ${title}`,
      body: template + footer,
      assignees: [
        'Juknum',
      ],
      labels: [
        'bug',
      ],
    });

    const embed = new EmbedBuilder()
      .setTitle(Strings.get('modal_feedback_generic_title', interaction.locale))
      .setDescription(Strings.get('modal_feedback_generic_description', interaction.locale, { keys: { LINK: `${response.data.html_url}` } }))
      .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
} as IModal;
