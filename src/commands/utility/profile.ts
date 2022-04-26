import { SlashCommand, SlashCommandI } from "@interfaces";
import { Client, CommandInteraction, Message, MessageEmbed } from "@client";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, GuildMember, MessageAttachment, User } from "discord.js";
import moment from "moment";
import axios from "axios";
import { imageButtons } from "@helpers/buttons";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setDefaultPermission(true)
		.setName("profile")
		.setDescription(`Get the profile of a user`)

		.addSubcommand((sub) =>
			sub
				.setName("minecraft")
				.setDescription("Minecraft profile of a user")
				.addStringOption((o) =>
					o.setName("username").setRequired(true).setDescription("Minecraft username of profile"),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName("discord")
				.setDescription("Discord profile of a user")
				.addUserOption((o) => o.setName("user").setDescription("Username of the discord profile").setRequired(true)),
		),
	execute: new Collection<string, SlashCommandI>()
		.set("discord", async (interaction: CommandInteraction, client: Client) => {
			const user = interaction.options.getUser("user") as User;
			const guildUser = interaction.guild.members.cache.get(user.id) as GuildMember;

			const bannerUrl = axios
				.get(`https://discord.com/api/users/${user.id}`, {
					headers: {
						Authorization: `Bot ${client.token}`,
					},
				})
				.then((res) => {
					const banner: string = res.data["banner"];

					if (banner) {
						const ext = banner.startsWith("a_") ? ".gif" : ".png";
						return `https://cdn.discordapp.com/banners/${user.id}/${banner}${ext}?size=1024`;
					}
				});

			const embed = new MessageEmbed()
				.setAuthor({ name: user.username, iconURL: user.avatarURL({ dynamic: true }) })
				.setThumbnail(user.avatarURL({ dynamic: true }))
				.setImage((await bannerUrl) ? await bannerUrl : "")
				.addFields(
					{ name: "Name & Tag", value: user.tag, inline: true },
					{ name: "Nickname", value: guildUser.nickname, inline: true },
					{ name: "ID", value: user.id, inline: true },
					{
						name: "Status",
						value: guildUser.presence?.status != undefined ? guildUser.presence?.status : "offline",
						inline: true,
					},
					{
						name: "Joined at",
						value: `<t:${moment(guildUser.joinedAt).utc().unix()}>\n<t:${moment(guildUser.joinedAt).utc().unix()}:R>`,
						inline: true,
					},
					{
						name: "Created at",
						value: `<t:${moment(user.createdTimestamp).utc().unix()}>\n<t:${moment(user.createdTimestamp)
							.utc()
							.unix()}:R>`,
						inline: true,
					},
				);
			interaction.reply({ embeds: [embed], fetchReply: true }).then((message: Message) => message.deleteButton());
		})
		.set("minecraft", async (interaction: CommandInteraction, client: Client) => {
			const mcProfile: string = await axios
				.get(`https://api.mojang.com/users/profiles/minecraft/${interaction.options.getString("username")}`)
				.then(async (res) => {
					handleStatus("mojang", res.status, interaction);
					if (res.statusText == "OK") return res.data;
				});

			const UUID = mcProfile["id"];
			const name = mcProfile["name"]; //gets the name with correct capitalization - important for optifine api

			//get mojang texture data for skin texture
			const textureB64 = await axios
				.get(`https://sessionserver.mojang.com/session/minecraft/profile/${UUID}`)
				.then((res) => {
					return res.data["properties"] ? res.data["properties"][0]["value"].toString() : undefined;
				});

			const textureJSON: textureJSON = JSON.parse(Buffer.from(textureB64, "base64").toString("ascii"))["textures"];

			const skinData = await axios
				.get(textureJSON["SKIN"]["url"], { responseType: "arraybuffer" })
				.then(async (res) => {
					handleStatus("mojang", res.status, interaction);
					if (res.statusText == "OK") return res.data;
				});

			// counts the least significant bits in every 4th byte in the uuid
			// an odd sum means alex and an even sum is steve
			// therefore XOR-ing all the LSBs returns either 1 (alex) or 0 (steve)
			const skinType = parseInt(UUID[7], 16) ^ parseInt(UUID[15], 16) ^ parseInt(UUID[23], 16) ^ parseInt(UUID[31], 16);
			const modelType = textureJSON["SKIN"]["metadata"] ? textureJSON["SKIN"]["metadata"]["model"] : "classic";

			//TODO: 3d rendering from side and back view in the base embed with split image method (ask nick)
			const baseEmbed = new MessageEmbed()
				.setTitle(name + "'s textures")
				.setThumbnail(`attachment://${name}.png`)
				.setDescription(
					[
						`Base Skin: **${skinType == 0 ? "steve" : "alex"}**`,
						`Model Type: **${modelType}**`,
						`UUID: **${UUID}**`,
					].join("\n"),
				);

			let cape: [MessageEmbed, MessageAttachment];

			if (textureJSON["CAPE"]) {
				cape = await axios.get(textureJSON["CAPE"]["url"], { responseType: "arraybuffer" }).then(async (res) => {
					handleStatus("mojang", res.status, interaction);
					if (res.statusText == "OK") {
						return [
							new MessageEmbed().setTitle(`${name}'s cape:`).setImage("attachment://MCcape.png"),
							new MessageAttachment(Buffer.from(res.data), "MCcape.png"),
						];
					}
				});
			} else {
				cape = await axios
					.get(`http://s.optifine.net/capes/${name}.png`, { responseType: "arraybuffer" })
					.then(async (res) => {
						handleStatus("optifine", res.status, interaction);
						if (res.statusText == "OK") {
							return [
								new MessageEmbed().setTitle(`${name}'s cape:`).setImage("attachment://OFcape.png"),
								new MessageAttachment(Buffer.from(res.data), "OFcape.png"),
							];
						}
					});
			}

			const MCskin: MessageAttachment = new MessageAttachment(Buffer.from(skinData), `${name}.png`);

			if (cape) {
				interaction.reply({
					embeds: [baseEmbed, cape[0]],
					files: [MCskin, cape[1]],
				});
			} else {
				interaction.reply({ embeds: [baseEmbed], files: [MCskin] });
			}
		}),
};

async function handleStatus(api: string, status: number, interaction: CommandInteraction) {
	if (status == 204)
		return interaction.reply({
			content: await interaction.getEphemeralString({ string: "Command.Profile.noContent" }),
			ephemeral: true,
		});
	else if (status != 200)
		return interaction.reply({
			content: (await interaction.getEphemeralString({ string: "Command.Profile.noResponse" })).replace("%API%", `${api} `),
			ephemeral: true,
		});
}

interface textureJSON {
	SKIN: {
		url: string;
		metadata: {
			model: string;
		};
	};
	CAPE: { url: string };
}
