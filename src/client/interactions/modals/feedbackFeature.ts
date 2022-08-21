import { IModal } from '@interfaces';
import { EmbedBuilder } from '@overrides';
import { octokit, Strings, templateLoad } from '@utils';
import { CacheType, ModalSubmitInteraction } from 'discord.js';

export default {
  id: 'feedback-feature',
  run: async (interaction: ModalSubmitInteraction<CacheType>) => {
    const title = interaction.fields.getTextInputValue('feedback-input-feature-title');
    const related = interaction.fields.getTextInputValue('feedback-input-feature-related');
    const description = interaction.fields.getTextInputValue('feedback-input-feature-description');
    const screenshots = interaction.fields.getTextInputValue('feedback-input-feature-screenshots');
    const notes = interaction.fields.getTextInputValue('feedback-input-feature-notes');

    const template = templateLoad('feedbackFeature.md')
      .replace('%RELATED_TO_EXISTING_PROBLEM%', related)
      .replace('%DESCRIPTION%', description)
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
