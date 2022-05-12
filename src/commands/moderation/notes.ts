import { Client, MessageEmbed } from "@client";
import { SlashCommandBuilder } from "@discordjs/builders";
import { colors } from "@helpers/colors";
import { fromTimestampToHumanReadable } from "@helpers/dates";
import { getGuildName } from "@helpers/guilds";
import { SlashCommand, SlashCommandI } from "@helpers/interfaces";
import { Note, User as ModerationUser } from "@helpers/interfaces/moderation";
import { getRolesIds } from "@helpers/roles";
import { checkIfUser } from "@helpers/users";
import { Collection, CommandInteraction, Message, User } from "discord.js";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("notes")
		.setDescription("Edit/See notes from a user")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("add")
				.setDescription("Add a note to a user")
				.addUserOption((option) =>
					option.setName("user").setDescription("The user you want to add a note to").setRequired(true),
				)
				.addStringOption((option) =>
					option.setName("note").setDescription("The note you want to add").setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("list")
				.setDescription("List notes of a user")
				.addUserOption((option) =>
					option.setName("user").setDescription("The user you want to add a note to").setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("edit")
				.setDescription(
					"Edit/Delete notes of a user, to delete a note, do not provide the note parameter (administrator)",
				)
				.addUserOption((option) =>
					option.setName("user").setDescription("The user you want to edit the note").setRequired(true),
				)
				.addNumberOption((option) =>
					option
						.setName("index")
						.setDescription("The index of the note you want to edit, starts at 0")
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("note")
						.setDescription(
							"The note you want to edit, note is deleted if you don't provide the parameter (admin only)",
						),
				),
		),
	execute: new Collection<string, SlashCommandI>()
		.set("add", async (interaction: CommandInteraction, client: Client) => {
			if (await interaction.perms({ roles: ["moderators", "trial_moderators"] })) return;

			let user: User = interaction.options.getUser("user", true) as User;
			if (!checkIfUser(client, user))
				return interaction.reply({ content: "The given parameter is not a user", ephemeral: true });

			let guildName: string = getGuildName(interaction.guildId, true);
			let moderationUser: ModerationUser = {
				id: user.id,
				username: user.username,
				notes: Object.assign(
					client.moderationUsers.get(user.id) ? client.moderationUsers.get(user.id).notes : {}, // old notes are conserved
					{
						[guildName]:
							client.moderationUsers.get(user.id)?.notes[guildName] === undefined
								? [
										{
											from: interaction.user.id,
											note: interaction.options.getString("note", true),
											timestamp: new Date().getTime(),
										},
								  ]
								: [
										...client.moderationUsers.get(user.id).notes[guildName],
										{
											from: interaction.user.id,
											note: interaction.options.getString("note", true),
											timestamp: new Date().getTime(),
										},
								  ],
					},
				),
			};

			client.moderationUsers.set(user.id, moderationUser);
			interaction.reply({
				content: "The note has been added!",
				embeds: [embedConstructor(user, guildName, client)],
				ephemeral: true,
			});
		})
		.set("list", async (interaction: CommandInteraction, client: Client) => {
			return interaction.reply({
				content: "This command is temporarily disabled! (complain to Discord for breaking slash command permissions)",
				ephemeral: true,
			});

			let user: User = interaction.options.getUser("user", true) as User;
			if (!checkIfUser(client, user))
				return interaction.reply({ content: "The given parameter is not a user", ephemeral: true });

			let guildName: string = getGuildName(interaction.guildId, true);
			if (client.moderationUsers.get(user.id).notes[guildName] === undefined)
				return interaction.reply({ content: "The user has no notes for this guild / guild team!", ephemeral: true });

			return interaction
				.reply({ embeds: [embedConstructor(user, guildName, client)], fetchReply: true })
				.then((msg: Message) => {
					msg.deleteButton();
				});
		})
		.set("edit", async (interaction: CommandInteraction, client: Client) => {
			return interaction.reply({
				content: "This command is temporarily disabled! (complain to Discord for breaking slash command permissions)",
				ephemeral: true,
			});

			let user: User = interaction.options.getUser("user", true) as User;
			if (!checkIfUser(client, user))
				return interaction.reply({ content: "The given parameter is not a user", ephemeral: true });

			let guildName: string = getGuildName(interaction.guildId, true);
			let moderationUser: ModerationUser = client.moderationUsers.get(user.id);
			if (moderationUser.notes[guildName] === undefined)
				return interaction.reply({ content: "The user has no notes for this guild / guild team" });

			let index: number = interaction.options.getNumber("index", true);
			let note: Note = moderationUser.notes[guildName][index];

			if (note === undefined) return interaction.reply({ content: "The given index is not valid", ephemeral: true });

			let isAdmin: boolean = getRolesIds({ name: "administrator", discords: [guildName], teams: [guildName] }).some(
				(r) => (interaction.member as any)._roles.includes(r),
			);

			if (note.from !== interaction.user.id && !isAdmin)
				return interaction.reply({ content: "You can't edit a note that isn't yours", ephemeral: true });

			let newNote = interaction.options.getString("note", false);

			// update the note if a new note is given
			if (newNote)
				moderationUser.notes[guildName][index] = {
					from: interaction.user.id,
					note: newNote,
					timestamp: new Date().getTime(),
				};
			// otherwise delete the note (if the user is an admin)
			else if (isAdmin) delete moderationUser.notes[guildName][index];
			else return interaction.reply({ content: "You must be an administrator to delete a note!", ephemeral: true });

			client.moderationUsers.set(user.id, moderationUser);
			return interaction.reply({
				content: "The note has been edited!",
				embeds: [embedConstructor(user, guildName, client)],
				ephemeral: true,
			});
		}),
};

const embedConstructor = (user: User, guildName: string, client: Client): MessageEmbed => {
	return new MessageEmbed()
		.setTitle(`Moderation notes of ${user.username}`)
		.setColor(colors.red)
		.setThumbnail(user.displayAvatarURL({ dynamic: true }))
		.addFields(
			client.moderationUsers.get(user.id).notes[guildName].map((n) => {
				return { name: `${fromTimestampToHumanReadable(n.timestamp)}`, value: `> From <@!${n.from}>\n${n.note}` };
			}),
		);
};
