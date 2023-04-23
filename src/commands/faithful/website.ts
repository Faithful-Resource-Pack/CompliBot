import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { colors } from "@helpers/colors";
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
					{ name: "Classic Faithful 32x Jappa", value: "classic_faithful_32x" },
					{ name: "Classic Faithful 64x", value: "classic_faithful_64x" },
					{ name: "Classic Faithful 32x Programmer Art", value: "classic_faithful_32x_progart" },
				),
		),
	execute: async (interaction: CommandInteraction) => {
		const embed = new MessageEmbed();
		const key: string | null = interaction.options.getString("name", false);
		const options: boolean = key !== null;

		if (options)
			embed
				.setTitle(websites[key].name)
				.setDescription(websites[key].value)
				.setColor(websites[key].color)
				.setThumbnail(websites[key].image);
		else
			embed
				.setTitle("Useful Links:")
				.setDescription (`
**General:**

[Website](https://faithfulpack.net/) • [Docs](https://docs.faithfulpack.net/) • [News](https://faithfulpack.net/news) • [License](https://faithfulpack.net/license) • [Translate](https://translate.faithfulpack.net/)

**Listings:**

[CurseForge](https://curseforge.com/members/faithful_resource_pack/projects) • [Modrinth](https://modrinth.com/user/faithful-resource-pack) • [Planet Minecraft](https://planetminecraft.com/member/faithful_resource_pack/) • [MCPEDL](https://mcpedl.com/user/faithful-resource-pack/) • [Minecraft Forum](https://www.minecraftforum.net/members/faithful_resource_pack)

**Media:**

[Twitter](https://twitter.com/faithfulpack/) • [Patreon](https://www.patreon.com/faithful_resource_pack) • [Reddit](https://reddit.com/r/faithfulpack/) • [Main GitHub](https://github.com/faithful-resource-pack/) • [Classic Faithful GitHub](https://github.com/classicfaithful/)
				`)
				.setColor(colors.c32)
				.setThumbnail("https://database.faithfulpack.net/images/branding/logos/transparent/512/plain_logo.png")
				.setFooter ({
					text: "Listings for specific packs can be found by running /website <pack>.",
					iconURL: "https://database.faithfulpack.net/images/branding/logos/transparent/512/plain_logo.png"
				})

		interaction.reply({ embeds: [embed]});
		if (options) ((await interaction.fetchReply()) as Message).deleteButton();
	},
};

const websites = {
	faithful_32: {
		image: "https://database.faithfulpack.net/images/branding/logos/transparent/512/f32_logo.png",
		color: 0x00a2ff, // sorry for hardcoded colors but this is how it's stored on the js bot and this is easier to port
		name: `Faithful 32x:`,
		value: `
[Website](https://faithfulpack.net/faithful32x/latest)

[Java Edition CurseForge](https://curseforge.com/minecraft/texture-packs/faithful-32x)

[Bedrock Edition CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/faithful-32x-bedrock)

[Modrinth](https://modrinth.com/resourcepack/faithful-32x)

[Planet Minecraft](https://planetminecraft.com/texture-pack/faithful-32x/)

[Java Edition GitHub](https://github.com/faithful-resource-pack/faithful-java-32x)

[Bedrock Edition GitHub](https://github.com/faithful-resource-pack/faithful-bedrock-32x)`,
	}, // also sorry for the really weird formatting, you need to remove all trailing spaces for it to render properly on certain platforms

	faithful_64: {
		image: "https://database.faithfulpack.net/images/branding/logos/transparent/512/f64_logo.png",
		color: 0xd8158d,
		name: "Faithful 64x:",
		value: `
[Website](https://faithfulpack.net/faithful64x/latest)

[Java Edition CurseForge](https://curseforge.com/minecraft/texture-packs/faithful-64x)

[Bedrock Edition CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/faithful-64x-bedrock)

[Modrinth](https://modrinth.com/resourcepack/faithful-64x)

[Planet Minecraft](https://planetminecraft.com/texture-pack/faithful-64x/)

[Java Edition GitHub](https://github.com/faithful-resource-pack/faithful-java-64x)

[Bedrock Edition GitHub](https://github.com/faithful-resource-pack/faithful-bedrock-64x)
		`,
	},

	classic_faithful_32x: {
		image: "https://database.faithfulpack.net/images/branding/logos/transparent/512/cf32_logo.png",
		color: 0x00c756,
		name: "Classic Faithful 32x Jappa:",
		value: `
[Website](https://faithfulpack.net/classicfaithful/32x-jappa)

[CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-32x-jappa)

[Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-32x)

[Java Edition GitHub](https://github.com/classicfaithful/32x-jappa)

[Bedrock Edition GitHub](https://github.com/classicfaithful/32x-jappa-bedrock)

[Add-ons GitHub](https://github.com/classicfaithful/32x-jappa-add-ons)
		`,
	},

	classic_faithful_64x: {
		image: "https://database.faithfulpack.net/images/branding/logos/transparent/512/cf64_logo.png",
		color: 0x9f00cf,
		name: "Classic Faithful 64x:",
		value: `
[Website](https://faithfulpack.net/classicfaithful/64x-jappa)

[CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-64x)

[Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-64x/)

[Java Edition GitHub](https://github.com/classicfaithful/64x-jappa)

[Bedrock Edition GitHub](https://github.com/classicfaithful/64x-jappa-bedrock)
		`,
	},

	classic_faithful_32x_progart: {
		image: "https://database.faithfulpack.net/images/branding/logos/transparent/512/cf32pa_logo.png",
		color: 0xa1db12,
		name: "Classic Faithful 32x PA:",
		value: `
[Website](https://faithfulpack.net/classicfaithful/32x-programmer-art)

[CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-32x-pa)

[Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-32x-pa)

[Java Edition GitHub](https://github.com/classicfaithful/32x-programmer-art)

[Bedrock Edition GitHub](https://github.com/classicfaithful/32x-programmer-art-bedrock)

[Add-ons GitHub](https://github.com/classicfaithful/32x-programmer-art-add-ons)
		`,
	}
};
