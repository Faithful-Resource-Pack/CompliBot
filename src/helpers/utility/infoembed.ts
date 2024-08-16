import { parseID, emojis } from "@utility/emojis";

//prettier-ignore
export const media: Record<string, { title: string, description: string }> = {
	faithful_32x: {
		title: `Faithful 32x:`,
		description: `
[${parseID(emojis.faithful_logo)} Website](https://faithfulpack.net/faithful32x)

[${parseID(emojis.curseforge)} Java Edition CurseForge](https://curseforge.com/minecraft/texture-packs/faithful-32x)

[${parseID(emojis.curseforge)} Bedrock Edition CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/faithful-32x-bedrock)

[${parseID(emojis.modrinth)} Modrinth](https://modrinth.com/resourcepack/faithful-32x)

[${parseID(emojis.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/faithful-32x/)

[${parseID(emojis.mcpedl)} MCPEDL](https://mcpedl.com/faithful-32x/)

[${parseID(emojis.github)} Java Edition GitHub](https://github.com/faithful-resource-pack/faithful-java-32x)

[${parseID(emojis.github)} Bedrock Edition GitHub](https://github.com/faithful-resource-pack/faithful-bedrock-32x)`,
	},
	faithful_64x: {
		title: "Faithful 64x:",
		description: `
[${parseID(emojis.faithful_logo)} Website](https://faithfulpack.net/faithful64x)

[${parseID(emojis.curseforge)} Java Edition CurseForge](https://curseforge.com/minecraft/texture-packs/faithful-64x)

[${parseID(emojis.curseforge)} Bedrock Edition CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/faithful-64x-bedrock)

[${parseID(emojis.modrinth)} Modrinth](https://modrinth.com/resourcepack/faithful-64x)

[${parseID(emojis.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/faithful-64x/)

[${parseID(emojis.mcpedl)} MCPEDL](https://mcpedl.com/faithful-64x/)

[${parseID(emojis.github)} Java Edition GitHub](https://github.com/faithful-resource-pack/faithful-java-64x)

[${parseID(emojis.github)} Bedrock Edition GitHub](https://github.com/faithful-resource-pack/faithful-bedrock-64x)
    `,
	},

	classic_faithful_32x: {
		title: "Classic Faithful 32x Jappa:",
		description: `
[${parseID(emojis.faithful_logo)} Website](https://faithfulpack.net/classicfaithful/32x-jappa)

[${parseID(emojis.curseforge)} CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-32x-jappa)

[${parseID(emojis.modrinth)} Modrinth](https://modrinth.com/resourcepack/classic-faithful-32x-jappa)

[${parseID(emojis.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-32x)

[${parseID(emojis.github)} Java Edition GitHub](https://github.com/classicfaithful/32x-jappa)

[${parseID(emojis.github)} Bedrock Edition GitHub](https://github.com/classicfaithful/32x-jappa-bedrock)

[${parseID(emojis.github)} Add-ons GitHub](https://github.com/classicfaithful/32x-jappa-add-ons)
    `,
	},

	classic_faithful_32x_progart: {
		title: "Classic Faithful 32x PA:",
		description: `
[${parseID(emojis.faithful_logo)} Website](https://faithfulpack.net/classicfaithful/32x-programmer-art)

[${parseID(emojis.curseforge)} CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-32x-pa)

[${parseID(emojis.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-32x-pa)

[${parseID(emojis.modrinth)} Modrinth](https://modrinth.com/resourcepack/classic-faithful-32x-programmer-art)

[${parseID(emojis.github)} Java Edition GitHub](https://github.com/classicfaithful/32x-programmer-art)

[${parseID(emojis.github)} Bedrock Edition GitHub](https://github.com/classicfaithful/32x-programmer-art-bedrock)

[${parseID(emojis.github)} Add-ons GitHub](https://github.com/classicfaithful/32x-programmer-art-add-ons)
    `,
	},

	classic_faithful_64x: {
		title: "Classic Faithful 64x:",
		description: `
[${parseID(emojis.faithful_logo)} Website](https://faithfulpack.net/classicfaithful/64x-jappa)

[${parseID(emojis.curseforge)} CurseForge](https://curseforge.com/minecraft/texture-packs/classic-faithful-64x)

[${parseID(emojis.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-64x/)

[${parseID(emojis.github)} Java Edition GitHub](https://github.com/classicfaithful/64x-jappa)

[${parseID(emojis.github)} Bedrock Edition GitHub](https://github.com/classicfaithful/64x-jappa-bedrock)
    `,
	},

	default: {
		title: "Useful Links:",
		description: `
### General:
[Website](https://faithfulpack.net/) • [Docs](https://docs.faithfulpack.net/) • [Web App](https://webapp.faithfulpack.net) • [License](https://faithfulpack.net/license) • [Translate](https://translate.faithfulpack.net/)
### Listings:
[CurseForge](https://curseforge.com/members/faithful_resource_pack/projects) • [Modrinth](https://modrinth.com/user/faithful-resource-pack) • [Planet Minecraft](https://planetminecraft.com/member/faithful_resource_pack/) • [MCPEDL](https://mcpedl.com/user/faithful-resource-pack/) • [Minecraft Forum](https://www.minecraftforum.net/members/faithful_resource_pack)
### Media:
[News](https://faithfulpack.net/news) • [Twitter](https://twitter.com/faithfulpack/) • [Reddit](https://reddit.com/r/faithfulpack/) • [Main GitHub](https://github.com/faithful-resource-pack/) • [Classic Faithful GitHub](https://github.com/classicfaithful/)`,
	},
};
