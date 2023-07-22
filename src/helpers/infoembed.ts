import { colors } from "./colors";
import { parseId, ids } from "./emojis";
import settings from "@json/dynamic/settings.json";

// sorry for the questionable indentation and formatting
// blame prettier for most of it but also discord sometimes rendering whitespace weirdly
export const media = {
	faithful_32x: {
		thumbnail: settings.images.faithful_32x,
		color: colors.f32,
		title: `Faithful 32x:`,
		description: `
[${parseId(ids.faithful_logo)} Website](https://faithfulpack.net/faithful32x/latest)

[${parseId(
			ids.curseforge,
		)} Java Edition CurseForge](https://curseforge.com/minecraft/texture-packs/faithful-32x)

[${parseId(
			ids.curseforge,
		)} Bedrock Edition CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/faithful-32x-bedrock)

[${parseId(ids.modrinth)} Modrinth](https://modrinth.com/resourcepack/faithful-32x)

[${parseId(ids.mcpedl)} MCPEDL](https://mcpedl.com/faithful-32x/)

[${parseId(ids.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/faithful-32x/)

[${parseId(
			ids.github,
		)} Java Edition GitHub](https://github.com/faithful-resource-pack/faithful-java-32x)

[${parseId(
			ids.github,
		)} Bedrock Edition GitHub](https://github.com/faithful-resource-pack/faithful-bedrock-32x)`,
	},

	faithful_64x: {
		thumbnail: settings.images.faithful_64x,
		color: colors.f64,
		title: "Faithful 64x:",
		description: `
[${parseId(ids.faithful_logo)} Website](https://faithfulpack.net/faithful64x/latest)

[${parseId(
			ids.curseforge,
		)} Java Edition CurseForge](https://curseforge.com/minecraft/texture-packs/faithful-64x)

[${parseId(
			ids.curseforge,
		)} Bedrock Edition CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/faithful-64x-bedrock)

[${parseId(ids.modrinth)} Modrinth](https://modrinth.com/resourcepack/faithful-64x)

[${parseId(ids.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/faithful-64x/)

[${parseId(
			ids.github,
		)} Java Edition GitHub](https://github.com/faithful-resource-pack/faithful-java-64x)

[${parseId(
			ids.github,
		)} Bedrock Edition GitHub](https://github.com/faithful-resource-pack/faithful-bedrock-64x)
    `,
	},

	classic_faithful_32x: {
		thumbnail: settings.images.classic_faithful_32x,
		color: colors.cf32,
		title: "Classic Faithful 32x Jappa:",
		description: `
[${parseId(ids.faithful_logo)} Website](https://faithfulpack.net/classicfaithful/32x-jappa)

[${parseId(
			ids.curseforge,
		)} CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-32x-jappa)

[${parseId(
			ids.pmc,
		)} Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-32x)

[${parseId(ids.github)} Java Edition GitHub](https://github.com/classicfaithful/32x-jappa)

[${parseId(
			ids.github,
		)} Bedrock Edition GitHub](https://github.com/classicfaithful/32x-jappa-bedrock)

[${parseId(ids.github)} Add-ons GitHub](https://github.com/classicfaithful/32x-jappa-add-ons)
    `,
	},

	classic_faithful_32x_progart: {
		thumbnail: settings.images.classic_faithful_32x_progart,
		color: colors.cf32pa,
		title: "Classic Faithful 32x PA:",
		description: `
[${parseId(ids.faithful_logo)} Website](https://faithfulpack.net/classicfaithful/32x-programmer-art)

[${parseId(
			ids.curseforge,
		)} CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-32x-pa)

[${parseId(
			ids.pmc,
		)} Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-32x-pa)

[${parseId(ids.github)} Java Edition GitHub](https://github.com/classicfaithful/32x-programmer-art)

[${parseId(
			ids.github,
		)} Bedrock Edition GitHub](https://github.com/classicfaithful/32x-programmer-art-bedrock)

[${parseId(
			ids.github,
		)} Add-ons GitHub](https://github.com/classicfaithful/32x-programmer-art-add-ons)
    `,
	},

	classic_faithful_64x: {
		thumbnail: settings.images.classic_faithful_64x,
		color: colors.cf64,
		title: "Classic Faithful 64x:",
		description: `
[${parseId(ids.faithful_logo)} Website](https://faithfulpack.net/classicfaithful/64x-jappa)

[${parseId(
			ids.curseforge,
		)} CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-64x)

[${parseId(
			ids.pmc,
		)} Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-64x/)

[${parseId(ids.github)} Java Edition GitHub](https://github.com/classicfaithful/64x-jappa)

[${parseId(
			ids.github,
		)} Bedrock Edition GitHub](https://github.com/classicfaithful/64x-jappa-bedrock)
    `,
	},

	general: {
		thumbnail:
			"https://database.faithfulpack.net/images/branding/logos/transparent/512/plain_logo.png",
		color: colors.brand,
		title: "Useful Links:",
		description: `
### General:
[Website](https://faithfulpack.net/) • [Docs](https://docs.faithfulpack.net/) • [Web App](https://webapp.faithfulpack.net) • [License](https://faithfulpack.net/license) • [Translate](https://translate.faithfulpack.net/)
### Listings:
[CurseForge](https://curseforge.com/members/faithful_resource_pack/projects) • [Modrinth](https://modrinth.com/user/faithful-resource-pack) • [Planet Minecraft](https://planetminecraft.com/member/faithful_resource_pack/) • [MCPEDL](https://mcpedl.com/user/faithful-resource-pack/) • [Minecraft Forum](https://www.minecraftforum.net/members/faithful_resource_pack)
### Media:
[News](https://faithfulpack.net/news) • [Twitter](https://twitter.com/faithfulpack/) • [Reddit](https://reddit.com/r/faithfulpack/) • [Main GitHub](https://github.com/faithful-resource-pack/) • [Classic Faithful GitHub](https://github.com/classicfaithful/)`,
	},
} as const;

export type mediaType = keyof typeof media;
