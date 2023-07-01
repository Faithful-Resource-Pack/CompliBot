import { colors } from "./colors";

// sorry for the questionable indentation
// the tabs cause issues otherwise with the formatting
export const media = {
	all: {
		thumbnail:
			"https://database.faithfulpack.net/images/branding/logos/transparent/512/plain_logo.png",
		color: colors.brand,
		title: "Useful Links:",
		description: `
**General:**

[Website](https://faithfulpack.net/) • [Docs](https://docs.faithfulpack.net/) • [News](https://faithfulpack.net/news) • [License](https://faithfulpack.net/license) • [Translate](https://translate.faithfulpack.net/)

**Listings:**

[CurseForge](https://curseforge.com/members/faithful_resource_pack/projects) • [Modrinth](https://modrinth.com/user/faithful-resource-pack) • [Planet Minecraft](https://planetminecraft.com/member/faithful_resource_pack/) • [MCPEDL](https://mcpedl.com/user/faithful-resource-pack/) • [Minecraft Forum](https://www.minecraftforum.net/members/faithful_resource_pack)

**Media:**

[Twitter](https://twitter.com/faithfulpack/) • [Patreon](https://www.patreon.com/faithful_resource_pack) • [Reddit](https://reddit.com/r/faithfulpack/) • [Main GitHub](https://github.com/faithful-resource-pack/) • [Classic Faithful GitHub](https://github.com/classicfaithful/)`,
	},

	faithful_32x: {
		thumbnail:
			"https://database.faithfulpack.net/images/branding/logos/transparent/512/f32_logo.png",
		color: colors.f32,
		title: `Faithful 32x:`,
		description: `
[Website](https://faithfulpack.net/faithful32x/latest)

[Java Edition CurseForge](https://curseforge.com/minecraft/texture-packs/faithful-32x)

[Bedrock Edition CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/faithful-32x-bedrock)

[Modrinth](https://modrinth.com/resourcepack/faithful-32x)

[MCPEDL](https://mcpedl.com/faithful-32x/)

[Planet Minecraft](https://planetminecraft.com/texture-pack/faithful-32x/)

[Java Edition GitHub](https://github.com/faithful-resource-pack/faithful-java-32x)

[Bedrock Edition GitHub](https://github.com/faithful-resource-pack/faithful-bedrock-32x)`,
	},

	faithful_64x: {
		thumbnail:
			"https://database.faithfulpack.net/images/branding/logos/transparent/512/f64_logo.png",
		color: colors.f64,
		title: "Faithful 64x:",
		description: `
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
		thumbnail:
			"https://database.faithfulpack.net/images/branding/logos/transparent/512/cf32_logo.png",
		color: colors.cf32,
		title: "Classic Faithful 32x Jappa:",
		description: `
[Website](https://faithfulpack.net/classicfaithful/32x-jappa)

[CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-32x-jappa)

[Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-32x)

[Java Edition GitHub](https://github.com/classicfaithful/32x-jappa)

[Bedrock Edition GitHub](https://github.com/classicfaithful/32x-jappa-bedrock)

[Add-ons GitHub](https://github.com/classicfaithful/32x-jappa-add-ons)
    `,
	},

	classic_faithful_64x: {
		thumbnail:
			"https://database.faithfulpack.net/images/branding/logos/transparent/512/cf64_logo.png",
		color: colors.cf64,
		title: "Classic Faithful 64x:",
		description: `
[Website](https://faithfulpack.net/classicfaithful/64x-jappa)

[CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-64x)

[Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-64x/)

[Java Edition GitHub](https://github.com/classicfaithful/64x-jappa)

[Bedrock Edition GitHub](https://github.com/classicfaithful/64x-jappa-bedrock)
    `,
	},

	classic_faithful_32x_progart: {
		thumbnail:
			"https://database.faithfulpack.net/images/branding/logos/transparent/512/cf32pa_logo.png",
		color: colors.cf32pa,
		title: "Classic Faithful 32x PA:",
		description: `
[Website](https://faithfulpack.net/classicfaithful/32x-programmer-art)

[CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-32x-pa)

[Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-32x-pa)

[Java Edition GitHub](https://github.com/classicfaithful/32x-programmer-art)

[Bedrock Edition GitHub](https://github.com/classicfaithful/32x-programmer-art-bedrock)

[Add-ons GitHub](https://github.com/classicfaithful/32x-programmer-art-add-ons)
    `,
	},
} as const;

export type mediaType = keyof typeof media;
