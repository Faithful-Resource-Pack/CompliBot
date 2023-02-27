import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { colors } from "@helpers/colors";
import { ids, parseId } from "@helpers/emojis";
import { Message, MessageEmbed, CommandInteraction } from "@client";

export const command: SlashCommand = {
	servers: ["faithful", "faithful_extra", "classic_faithful"],
	data: new SlashCommandBuilder()
		.setName("website")
		.setDescription("Displays all sites for the given resource pack.")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Name of the resource pack you want to see the sites of.")
				.addChoices(
					{ name: "Faithful 32x", value: "faithful_32" },
					{ name: "Faithful 64x", value: "faithful_64" },
					{ name: "Faithful Extras", value: "faithful_extras" },
				),
		),
	execute: async (interaction: CommandInteraction) => {
		const embed = new MessageEmbed();
		const key: string | null = interaction.options.getString("name", false);
		const options: boolean = key !== null;

		if (options)
			embed
				.setTitle(`${websites[key].name} websites:`)
				.setDescription(`${websites[key].value}`)
				.setColor(websites[key].color)
				.setThumbnail(websites[key].image);
		else embed.setTitle("Websites: ").addFields(Object.values(websites));

		interaction.reply({ embeds: [embed], ephemeral: !options });
		if (options) ((await interaction.fetchReply()) as Message).deleteButton();
	},
};

const websites = {
	faithful_32: {
		image: "https://database.faithfulpack.net/images/branding/logos/transparent/512/f32_logo.png",
		color: colors.c32,
		name: `Faithful 32x`,
		value: `[${parseId(ids.f32_logo)} Website](https://www.faithfulpack.net/faithful32x/latest)\n[${parseId(
			ids.curseforge,
		)} CurseForge | Java](https://www.curseforge.com/minecraft/texture-packs/faithful-32x)\n[${parseId(
			ids.curseforge,
		)} CurseForge | Bedrock](https://www.curseforge.com/minecraft-bedrock/addons/faithful-32x-bedrock)\n[${parseId(
			ids.planet_mc,
		)} Planet Minecraft](https://www.planetminecraft.com/texture-pack/faithful-32x/)`,
	},

	faithful_64: {
		image: "https://database.faithfulpack.net/images/branding/logos/transparent/512/f64_logo.png",
		color: colors.c64,
		name: "Faithful 64x",
		value: `[${parseId(ids.f64_logo)} Website](https://www.faithfulpack.net/faithful64x/latest)\n[${parseId(
			ids.curseforge,
		)} CurseForge | Java](https://www.curseforge.com/minecraft/texture-packs/faithful-64x)\n[${parseId(
			ids.curseforge,
		)} CurseForge | Bedrock](https://www.curseforge.com/minecraft-bedrock/addons/faithful-64x-bedrock)\n[${parseId(
			ids.planet_mc,
		)} Planet Minecraft](https://www.planetminecraft.com/texture-pack/faithful-64x/)`,
	},

	faithful_extras: {
		image: "https://database.faithfulpack.net/images/brand/logos/transparent/512/extras_logo.png",
		color: colors.c32,
		name: "Faithful Extras",
		value: `[${parseId(ids.addons_logo)} Add-on Gallery](https://faithfulpack.net/addons/)\n[${parseId(
			ids.mods_logo,
		)} Mod Picker](https://www.faithfulpack.net/mods)\n[${parseId(
			ids.addons_logo,
		)} Modpack Picker](https://faithfulpack.net/modpacks)`,
	}
};
