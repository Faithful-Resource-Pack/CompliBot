import { Client, MessageEmbed } from "@src/Extended Discord";

import { CommandInteraction, Message, TextChannel } from "discord.js";
import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Poll } from "@helpers/class/poll";
import { addMinutes } from "@helpers/dates";
import { ids, parseId } from "@helpers/emojis";
import { EmbedField } from "slash-commands";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("poll")
		.setDescription("You want to ask something?")
		.addStringOption((option) =>
			option.setName("question").setDescription("Write the question here.").setRequired(true),
		)
		.addNumberOption((option) =>
			option.setName("answers").setDescription("How many answers does the poll have? (Max: 5)").setRequired(true),
		)
		.addNumberOption((option) => option.setName("timeout").setDescription("Timeout for the vote. (in minutes!)"))
		.addBooleanOption((option) => option.setName("anonymous").setDescription("Are votes anonymous?"))
		.addBooleanOption((option) => option.setName("thread").setDescription("Did you want a thread for this question?"))
		.addBooleanOption((option) =>
			option.setName("yesno").setDescription("Did you want YES/NO format? Only works if 2 answers are provided."),
		)
		.addStringOption((option) =>
			option.setName("description").setDescription("Add more information about your poll here!."),
		)
		,
	execute: async (interaction: CommandInteraction, client: Client) => {
		const timeoutVal: number | null = interaction.options.getNumber("timeout", false);
		const _answersCount: number =  interaction.options.getNumber("answers", true);
		const yesno: boolean = interaction.options.getBoolean("yesno", false) === true ? true : false;
		const question: string = interaction.options.getString("question", true);
		const thread: boolean = interaction.options.getBoolean("thread", false) === true ? true : false;
		const description: string = interaction.options.getString("description", false);
		const anonymous: boolean = interaction.options.getBoolean("anonymous", false) === true ? true : false;
		const answersCount: number = yesno ? 2 : (_answersCount > 5 ? 5 : (_answersCount < 2 ? 2 : _answersCount)) ;

		// instantiate a new poll
		const poll = new Poll();
		
		// setup timeout
		if (timeoutVal !== null) poll.setTimeout(addMinutes(new Date, timeoutVal));
		else poll.setTimeout(0);

		/* default embed */
		const embed = new MessageEmbed()
			.setTitle("Poll constructor:")
			.setDescription(`Please send a message below for each ${answersCount} answers:`)
			.setFooter({ text: "use /poll to make a poll!" });

		interaction.reply({ embeds: [embed] });

		/* watching for message with answers */
		const filter = (m) => m.author.id === interaction.member.user.id;

		let answersArr: Array<string> = [];
		let response: any;
		const yesnoEmojis: Array<string> = [parseId(ids.upvote), parseId(ids.downvote)];
		const numberEmojis: Array<string> = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
		embed.addField("Answers", "None", true);
		do {
			try {
				const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] });
				answersArr.push(collected.first().content);
				try {
					collected.first().delete();
				} catch (_err) {
					/* message can't be deleted */
				}
			} catch (err) {
				answersArr.push(err);
			}

			embed.setDescription(`Waiting for answers... ${answersCount - answersArr.length} left.`)
			embed.setFields(embed.fields.map((field: EmbedField) => {
				if (field.name === "Answers") field.value = answersArr
					.map((answer: string, index: number) => `${yesno ? yesnoEmojis[index] : numberEmojis[index]} ${answer}`)
					.join('\n');
				return field;
			}));
			
			response = await interaction.editReply({ embeds: [embed] });
		} while (answersArr.length < answersCount);

    if (description) embed.setDescription(description);
		else embed.description = null;
		
		poll.setAnonymous(anonymous);
		poll.postSubmissionMessage(interaction, embed, {
			question,
			yesno,
			answersArr
		})
		
		/* create thread if true */
		if (thread)
			(interaction.channel as TextChannel).threads.create({ name: `Debate: ${question}`, reason: "Discuss about that poll here!" });
	},
};
