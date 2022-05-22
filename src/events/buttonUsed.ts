import { Button, Event } from '@interfaces';
import { Client, ButtonInteraction } from '@client';
import { info } from '@helpers/logger';

const event: Event = {
  name: 'buttonUsed',
  run: async (client: Client, interaction: ButtonInteraction) => {
    client.storeAction('button', interaction);

    if (client.verbose) console.log(`${info}Button used`);
    let button: Button;

    if (interaction.customId.startsWith('pollVote__')) button = client.buttons.get('pollVote');
    else button = client.buttons.get(interaction.customId);

    if (button) button.execute(client, interaction);
  },
};

export default event;
