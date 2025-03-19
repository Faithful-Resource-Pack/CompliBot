import { parseID, emojis } from "@utility/emojis";

//prettier-ignore
export const media: Record<string, { title: string, description: string }> = {
	faithful_32x: {
		title: `Faithful 32x:`,
		description: `
[${parseID(emojis.main_logo)} Website](https://faithfulpack.net/faithful32x)

[${parseID(emojis.curseforge)} Java Edition CurseForge](https://curseforge.com/minecraft/texture-packs/faithful-32x)

[${parseID(emojis.curseforge)} Bedrock Edition CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/faithful-32x-bedrock)

[${parseID(emojis.modrinth)} Modrinth](https://modrinth.com/resourcepack/faithful-32x)

[${parseID(emojis.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/faithful-32x/)

[${parseID(emojis.mcpedl)} MCPEDL](https://mcpedl.com/faithful-32x/)

[${parseID(emojis.github)} Java Edition GitHub](https://github.com/faithful-resource-pack/faithful-32x-java)

[${parseID(emojis.github)} Bedrock Edition GitHub](https://github.com/faithful-resource-pack/faithful-32x-bedrock)`,
	},
	faithful_64x: {
		title: "Faithful 64x:",
		description: `
[${parseID(emojis.main_logo)} Website](https://faithfulpack.net/faithful64x)

[${parseID(emojis.curseforge)} Java Edition CurseForge](https://curseforge.com/minecraft/texture-packs/faithful-64x)

[${parseID(emojis.curseforge)} Bedrock Edition CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/faithful-64x-bedrock)

[${parseID(emojis.modrinth)} Modrinth](https://modrinth.com/resourcepack/faithful-64x)

[${parseID(emojis.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/faithful-64x/)

[${parseID(emojis.mcpedl)} MCPEDL](https://mcpedl.com/faithful-64x/)

[${parseID(emojis.github)} Java Edition GitHub](https://github.com/faithful-resource-pack/faithful-64x-java)

[${parseID(emojis.github)} Bedrock Edition GitHub](https://github.com/faithful-resource-pack/faithful-64x-bedrock)
    `,
	},

	classic_faithful_32x_progart: {
		title: "Classic Faithful 32x:",
		description: `
[${parseID(emojis.main_logo)} Website](https://faithfulpack.net/classic32x)

[${parseID(emojis.curseforge)} CurseForge](https://www.curseforge.com/minecraft/texture-packs/classic-faithful-32x)

[${parseID(emojis.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-32x-pa)

[${parseID(emojis.modrinth)} Modrinth](https://modrinth.com/resourcepack/classic-faithful-32x)

[${parseID(emojis.github)} Java Edition GitHub](https://github.com/classicfaithful/classic-32x-java)

[${parseID(emojis.github)} Bedrock Edition GitHub](https://github.com/classicfaithful/classic-32x-bedrock)

[${parseID(emojis.github)} Add-ons GitHub](https://github.com/classicfaithful/classic-32x-add-ons)
    `,
	},


	classic_faithful_32x: {
		title: "Classic Faithful 32x Jappa:",
		description: `
[${parseID(emojis.main_logo)} Website](https://faithfulpack.net/classic32x-jappa)

[${parseID(emojis.curseforge)} CurseForge](https://www.curseforge.com/minecraft/texture-packs/classic-faithful-32x-jappa)

[${parseID(emojis.modrinth)} Modrinth](https://modrinth.com/resourcepack/classic-faithful-32x-jappa)

[${parseID(emojis.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-32x)

[${parseID(emojis.github)} Java Edition GitHub](https://github.com/classicfaithful/classic-32x-jappa-java)

[${parseID(emojis.github)} Bedrock Edition GitHub](https://github.com/classicfaithful/classic-32x-jappa-bedrock)

[${parseID(emojis.github)} Add-ons GitHub](https://github.com/classicfaithful/classic-32x-jappa-add-ons)
    `,
	},

	classic_faithful_64x: {
		title: "Classic Faithful 64x Jappa:",
		description: `
[${parseID(emojis.main_logo)} Website](https://faithfulpack.net/classic64x-jappa)

[${parseID(emojis.curseforge)} CurseForge](https://www.curseforge.com/minecraft/texture-packs/classic-faithful-64x-jappa)

[${parseID(emojis.pmc)} Planet Minecraft](https://planetminecraft.com/texture-pack/classic-faithful-64x/)

[${parseID(emojis.github)} Java Edition GitHub](https://github.com/classicfaithful/classic-64x-jappa-java)

[${parseID(emojis.github)} Bedrock Edition GitHub](https://github.com/classicfaithful/classic-64x-jappa-bedrock)
    `,
	},

	default: {
		title: "Useful Links:",
		description: `
### General:
[Website](https://faithfulpack.net/) • [Docs](https://docs.faithfulpack.net/) • [Web App](https://webapp.faithfulpack.net) • [License](https://faithfulpack.net/license) • [Translate](https://translate.faithfulpack.net/)
### Listings:
[Website](https://faithfulpack.net/news) • [CurseForge](https://www.curseforge.com/members/faithful_resource_pack/projects) • [Modrinth](https://modrinth.com/user/faithful-resource-pack) • [Planet Minecraft](https://planetminecraft.com/member/faithful_resource_pack/) • [MCPEDL](https://mcpedl.com/user/faithful-resource-pack/)
### Media:
[Twitter](https://twitter.com/faithfulpack/) • [Bluesky](https://bsky.app/profile/faithfulpack.net) • [Reddit](https://reddit.com/r/faithfulpack/) • [Main GitHub](https://github.com/faithful-resource-pack/) • [Classic Faithful GitHub](https://github.com/classicfaithful/)`,
	},
};
