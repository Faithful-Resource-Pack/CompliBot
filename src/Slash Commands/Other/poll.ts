// import MessageEmbed from "@src/Client/embed";
import Client from "@src/Client";

import { CommandInteraction, Message, TextChannel } from "discord.js";
import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
// import { ids, parseId } from "@src/Helpers/emojis";
// import { Polls } from "@src/Functions/poll";

export const command: SlashCommand = {
	permissions: undefined,
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
		.addBooleanOption((option) =>
			option.setName("multiple").setDescription("If set to true, the user would be able to choose multiple answers."),
		),
	execute: async (interaction: CommandInteraction, client: Client) => {
		interaction.reply({ content: "This command isn't finished yet.", ephemeral: true });

		return;
		// todo: finish this using API & uncreated yet poll collection

		// /* params */
		// const _a: number = interaction.options.getNumber("answers", true);
		// const answers: number | 2 = _a > 2 ? (_a > 5 ? 5 : _a) : 2;
		// const question: string = interaction.options.getString("question", true);
		// const yesno: boolean = interaction.options.getBoolean("yesno", false) === true && answers === 2 ? true : false;
		// const _t: number | null = interaction.options.getNumber("timeout", false);
		// const timeout: number | null = _t > 0 ? _t : null;
		// const endsAt: number | null = timeout === null ? null : new Date().getTime() + timeout * 60000;
		// const thread: boolean = interaction.options.getBoolean("thread", false) === true ? true : false;
		// const anonymous: boolean = interaction.options.getBoolean("anonymous", false) === true ? true : false;
		// const multiple: boolean = interaction.options.getBoolean("multiple", false);
		// const poll = new Polls(client);

		// /* default embed */
		// const embed = new MessageEmbed()
		// 	.setTitle("Poll constructor:")
		// 	.setDescription(`Please send a message below for each ${answers} answers:`)
		// 	.setFooter({ text: poll._footer });

		// interaction.reply({ embeds: [embed] });

		// /* watching for message with answers */
		// const filter = (m) => m.author.id === interaction.member.user.id;
		// let answersArr: Array<string> = [];
		// let response: any;
		// do {
		// 	try {
		// 		const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] });
		// 		answersArr.push(collected.first().content);
		// 		try {
		// 			collected.first().delete();
		// 		} catch (_err) {
		// 			/* message can't be deleted */
		// 		}
		// 	} catch (err) {
		// 		answersArr.push(err);
		// 	}

		// 	embed.setDescription(
		// 		`Waiting for answers... ${answers - answersArr.length} left.\n\n**Answers:**\n${answersArr
		// 			.map((el) => `- ${el}`)
		// 			.join("\n")}`,
		// 	);
		// 	response = await interaction.editReply({ embeds: [embed] });
		// } while (answersArr.length < answers);

		// /* building embed with all answers */
		// const yesnoEmojis: Array<string> = [parseId(ids.upvote), parseId(ids.downvote)];
		// const numberEmojis: Array<string> = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

		// embed.setTitle(question);
		// embed.setDescription(
		// 	answersArr.map((el, index) => `${yesno ? yesnoEmojis[index] : numberEmojis[index]} ${el}`).join("\n"),
		// );
		// if (timeout) embed.addField(poll._field, `<t:${(endsAt / 1000).toFixed(0)}:R>`, true);

		// await interaction.editReply({ embeds: [embed] });

		// /* add it to local data if so */
		// poll
		// 	.setChannel(response.channelId)
		// 	.setGuild(response.guildId)
		// 	.setMessage(response.id)
		// 	.setTimeout(timeout == null ? null : endsAt)
		// 	// .setMultipleVote() // todo
		// 	.addPoll();

		// /* add reactions */
		// if (yesno) {
		// 	response.react(ids.upvote);
		// 	response.react(ids.downvote);
		// } else
		// 	answersArr.forEach(async (_el, index) => {
		// 		try {
		// 			await (response as Message).react(numberEmojis[index]);
		// 		} catch (_e) {}
		// 	});

		// /* create thread if true */
		// if (thread)
		// 	(response.channel as TextChannel).threads.create({ name: question, reason: "Discuss about that poll here!" });
	},
};
