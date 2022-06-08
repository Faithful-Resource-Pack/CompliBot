import { SlashCommand, SlashCommandI } from '@interfaces';
import {
  Client, CommandInteraction, Message, MessageEmbed,
} from '@client';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  Collection, GuildMember, MessageAttachment, User,
} from 'discord.js';
import moment from 'moment';
import axios from 'axios';

async function handleStatus(api: string, status: number, interaction: CommandInteraction): Promise<void> {
  if (status === 204) {
    interaction.reply({
      content: await interaction.getEphemeralString({
        string: 'Command.Profile.noContent',
      }),
      ephemeral: true,
    });
  } else if (status !== 200) {
    interaction.reply({
      content: (
        await interaction.getEphemeralString({
          string: 'Command.Profile.noResponse',
        })
      ).replace('%API%', `${api} `),
      ephemeral: true,
    });
  }
}

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Get the profile of a user')

    .addSubcommand((sub) => sub
      .setName('minecraft')
      .setDescription('Minecraft profile of a user')
      .addStringOption((o) => o.setName('username').setRequired(true).setDescription('Minecraft username of profile')))
    .addSubcommand((sub) => sub
      .setName('discord')
      .setDescription('Discord profile of a user')
      .addUserOption((o) => o.setName('user').setDescription('Username of the discord profile').setRequired(true))),
  execute: new Collection<string, SlashCommandI>()
    .set('discord', async (interaction: CommandInteraction, client: Client) => {
      const user = interaction.options.getUser('user') as User;
      const guildUser = interaction.guild.members.cache.get(user.id) as GuildMember;

      const bannerUrl = axios
        .get(`https://discord.com/api/users/${user.id}`, {
          headers: {
            Authorization: `Bot ${client.token}`,
          },
        })
        .then((res) => {
          const { banner } = res.data;

          if (banner) {
            const ext = banner.startsWith('a_') ? '.gif' : '.png';
            return `https://cdn.discordapp.com/banners/${user.id}/${banner}${ext}?size=1024`;
          }

          return '';
        });

      const embed = new MessageEmbed()
        .setAuthor({
          name: user.username,
          iconURL: user.avatarURL({
            dynamic: true,
          }),
        })
        .setThumbnail(
          user.avatarURL({
            dynamic: true,
          }),
        )
        .setImage((await bannerUrl) ? await bannerUrl : '')
        .addFields(
          {
            name: 'Name & Tag',
            value: user.tag,
            inline: true,
          },
          {
            name: 'Nickname',
            value: guildUser.nickname ? guildUser.nickname : 'none',
            inline: true,
          },
          {
            name: 'ID',
            value: user.id,
            inline: true,
          },
          {
            name: 'Status',
            value: guildUser.presence?.status !== undefined ? guildUser.presence?.status : 'offline',
            inline: true,
          },
          {
            name: 'Joined at',
            value: `<t:${moment(guildUser.joinedAt).utc().unix()}>\n<t:${moment(guildUser.joinedAt).utc().unix()}:R>`,
            inline: true,
          },
          {
            name: 'Created at',
            value: `<t:${moment(user.createdTimestamp).utc().unix()}>\n<t:${moment(user.createdTimestamp)
              .utc()
              .unix()}:R>`,
            inline: true,
          },
        );
      interaction
        .reply({
          embeds: [embed],
          fetchReply: true,
        })
        .then((message: Message) => message.deleteButton());
    })
    .set('minecraft', async (interaction: CommandInteraction) => {
      const mcProfile = await axios
        .get(`https://api.mojang.com/users/profiles/minecraft/${interaction.options.getString('username')}`)
        .then(async (res) => {
          handleStatus('mojang', res.status, interaction);
          if (res.statusText === 'OK') return res.data;
          return undefined;
        });

      // gets the UUID & username with correct capitalization - important for optifine api
      const { name, id: UUID } = mcProfile;

      // get mojang texture data for skin texture
      const textureB64 = await axios
        .get(`https://sessionserver.mojang.com/session/minecraft/profile/${UUID}`)
        .then((res) => (res.data.properties ? res.data.properties[0].value.toString() : undefined));

      const textureJSON: TextureJSON = JSON.parse(Buffer.from(textureB64, 'base64').toString('ascii')).textures;

      const skinData = await axios
        .get(textureJSON.SKIN.url, {
          responseType: 'arraybuffer',
        })
        .then(async (res) => {
          handleStatus('mojang', res.status, interaction);
          if (res.statusText === 'OK') return res.data;
          return undefined;
        });

      // counts the least significant bits in every 4th byte in the uuid
      // an odd sum means Alex and an even sum is Steve
      // therefore XOR-ing all the LSBs returns either 1 (Alex) or 0 (Steve)
      const skinType = parseInt(UUID[7], 16) ^ parseInt(UUID[15], 16) ^ parseInt(UUID[23], 16) ^ parseInt(UUID[31], 16);
      const modelType = textureJSON.SKIN.metadata ? textureJSON.SKIN.metadata.model : 'classic';

      // TODO: 3d rendering from side and back view in the base embed with split image method (ask nick)
      const baseEmbed = new MessageEmbed()
        .setTitle(`${name}'s textures`)
        .setThumbnail(`attachment://${name}.png`)
        .setDescription(
          [
            `Base Skin: **${skinType === 0 ? 'steve' : 'alex'}**`,
            `Model Type: **${modelType}**`,
            `UUID: **${UUID}**`,
          ].join('\n'),
        );

      // let cape: Array<{ embed: MessageEmbed, attachment: MessageAttachment }>;
      const capeEmbeds: Array<MessageEmbed> = [];
      const capeAttachments: Array<MessageAttachment> = [];

      // try with Mojang cape
      if (textureJSON.CAPE) {
        try {
          await axios.get(textureJSON.CAPE.url, { responseType: 'arraybuffer' })
            .then((res) => {
              handleStatus('mojang', res.status, interaction);
              if (res.statusText === 'OK') {
                capeEmbeds.push(new MessageEmbed().setTitle(`${name}'s cape`).setImage('attachment://MCcape.png'));
                capeAttachments.push(new MessageAttachment(Buffer.from(res.data), 'MCcape.png'));
              }
            });
        } catch (e) {
          // no cape found
        }
      }

      // try with OF cape
      try {
        await axios.get(`http://s.optifine.net/capes/${name}.png`, { responseType: 'arraybuffer' })
          .then((res) => {
            handleStatus('optifine', res.status, interaction);
            if (res.statusText === 'OK') {
              capeEmbeds.push(new MessageEmbed().setTitle(`Optifine ${name}'s cape:`).setImage('attachment://OFcape.png'));
              capeAttachments.push(new MessageAttachment(Buffer.from(res.data), 'OFcape.png'));
            }
          });
      } catch (e) {
        // no OF cape found
      }

      const MCskin: MessageAttachment = new MessageAttachment(Buffer.from(skinData), `${name}.png`);

      if (capeEmbeds.length > 0 && capeAttachments.length > 0) {
        interaction.reply({
          embeds: [baseEmbed, ...capeEmbeds],
          files: [MCskin, ...capeAttachments],
        });
      } else {
        interaction.reply({
          embeds: [baseEmbed],
          files: [MCskin],
        });
      }
    }),
};

export default command;

interface TextureJSON {
  SKIN: {
    url: string;
    metadata: {
      model: string;
    };
  };
  CAPE: {
    url: string;
  };
}
