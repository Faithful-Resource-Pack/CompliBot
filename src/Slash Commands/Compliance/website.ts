import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { colors } from "@src/Helpers/colors";
import { ids, parseId } from "@src/Helpers/emojis";
import Message from "@src/Client/message";
import MessageEmbed from "@/src/Client/embed";
import { CommandInteraction } from "@src/Client/interaction";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("website")
		.setDescription("Displays websites for the given keyword.")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Name of the project you want to see websites.")
				.addChoices([
					["Compliance 32x", "compliance_32"],
					["Compliance 64x", "compliance_64"],
					["Compliance Add-ons", "compliance_addons"],
					["Compliance Dungeons 32x", "compliance_dungeons_32"],
					["Compliance Mods 32x", "compliance_mods_32"],
					["Compliance Tweaks 32x", "compliance_tweaks_32"],
				]),
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
	compliance_32: {
		image: "https://database.compliancepack.net/images/brand/logos/no%20background/512/Compliance%20Basic.png",
		color: colors.c32,
		name: `Compliance 32x`,
		value: `[${parseId(ids.c32)} Website](https://www.compliancepack.net/compliance32x/latest)\n[${parseId(
			ids.curseforge,
		)} CurseForge | Java](https://www.curseforge.com/minecraft/texture-packs/compliance-32x)\n[${parseId(
			ids.curseforge,
		)} CurseForge | Bedrock](https://www.curseforge.com/minecraft-bedrock/addons/compliance-32x-bedrock)\n[${parseId(
			ids.planet_mc,
		)} Planet Minecraft](https://www.planetminecraft.com/texture-pack/compliance-32x/)`,
	},
	compliance_64: {
		image: "https://database.compliancepack.net/images/brand/logos/no%20background/512/Compliance%2064.png",
		color: colors.c64,
		name: "Compliance 64x",
		value: `[${parseId(ids.c64)} Website](https://www.compliancepack.net/compliance64x/latest)\n[${parseId(
			ids.curseforge,
		)} CurseForge | Java](https://www.curseforge.com/minecraft/texture-packs/compliance-64x)\n[${parseId(
			ids.curseforge,
		)} CurseForge | Bedrock](https://www.curseforge.com/minecraft-bedrock/addons/compliance-64x-bedrock)\n[${parseId(
			ids.planet_mc,
		)} Planet Minecraft](https://www.planetminecraft.com/texture-pack/compliance-64x/)`,
	},
	compliance_dungeons_32: {
		image: "https://database.compliancepack.net/images/brand/logos/no%20background/512/Compliance%20Dungeons.png",
		color: colors.cdungeons,
		name: "Compliance Dungeons 32x",
		value: `[${parseId(
			ids.cdungeons,
		)} Website](https://www.compliancepack.net/compliance32xDungeons/latest)\n[${parseId(
			ids.curseforge,
		)} CurseForge](https://www.curseforge.com/minecraft-dungeons/mods/compliance-dungeons)`,
	},
	compliance_mods_32: {
		image: "https://database.compliancepack.net/images/brand/logos/no%20background/512/Compliance%20Mods.png",
		color: colors.cmods,
		name: "Compliance Mods 32x",
		value: `[${parseId(ids.cmods)} Mods Resource Pack picker](https://www.compliancepack.net/mods)\n[${parseId(
			ids.cmods,
		)} Modpacks Resource Pack pressets](https://www.compliancepack.net/modpacks)`,
	},
	compliance_tweaks_32: {
		image: "https://database.compliancepack.net/images/brand/logos/no%20background/512/Compliance%20Tweaks.png",
		color: colors.ctweaks,
		name: "Compliance Tweaks",
		value: `[${parseId(ids.ctweaks)} Website](https://www.compliancepack.net/tweaks)`,
	},
	compliance_addons: {
		image: "https://database.compliancepack.net/images/brand/logos/no%20background/512/Compliance%20Add-ons.png",
		color: colors.caddons,
		name: "Compliance Addons",
		value: `[${parseId(ids.ctweaks)} All resolutions](https://www.compliancepack.net/addons)\n[${parseId(
			ids.ctweaks,
		)} Collections](https://www.compliancepack.net/addonCollections)`,
	},
};
