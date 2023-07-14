import { MessageEmbed } from "@client";
import TokenJson from "@json/tokens.json";
import { Tokens } from "@interfaces";
import axios from "axios";
import getDimensions from "./canvas/getDimensions";
import { MessageAttachment, Guild } from "discord.js";
import { magnifyAttachment } from "./canvas/magnify";
import { ISizeCalculationResult } from "image-size/dist/types/interface";
import { colors } from "@helpers/colors";
import { Contributions, Texture, Paths, Uses, Contribution } from "@helpers/interfaces/firestorm";
import { animateAttachment } from "./canvas/animate";
import { formatName, minecraftSorter, addPathsToEmbed } from "@helpers/sorter";

export const getTextureMessageOptions = async (options: {
	texture: Texture;
	pack: string;
	guild: Guild;
}): Promise<[MessageEmbed, Array<MessageAttachment>]> => {
	const tokens: Tokens = TokenJson;
	const texture = options.texture;
	const pack = options.pack;
	const guild = options.guild;
	const uses: Uses = texture.uses;
	const paths: Paths = texture.paths;
	const allContributions: Contributions = texture.contributions;
	const animated: boolean = paths.filter((p) => p.mcmeta === true).length !== 0;
	const contributionJSON = (
		await axios.get("https://api.faithfulpack.net/v2/contributions/authors")
	).data;

	let mcmeta: any = {};
	if (animated) {
		const [animatedPath] = paths.filter((p) => p.mcmeta === true);
		const animatedUse = uses.find((u) => u.id === animatedPath.use);

		try {
			mcmeta = (
				await axios.get(
					`https://raw.githubusercontent.com/CompliBot/Default-Java/${
						animatedPath.versions.sort(minecraftSorter).reverse()[0]
					}/assets/${animatedUse.assets}/${animatedPath.name}.mcmeta`,
				)
			).data;
		} catch {
			mcmeta = { __comment: "mcmeta file not found, please check default repository" };
		}
	}

	const [strPack, strIconURL] = formatName(pack);

	const files: Array<MessageAttachment> = [];
	const embed = new MessageEmbed().setTitle(`[#${texture.id}] ${texture.name}`).setFooter({
		text: `${strPack}`,
		iconURL: strIconURL,
	});

	let textureURL: string;
	try {
		textureURL = (await axios.get(`${tokens.apiUrl}textures/${texture.id}/url/${pack}/latest`))
			.request.res.responseUrl;
	} catch {
		textureURL = "";
	}

	embed.setThumbnail(textureURL);
	embed.setImage(`attachment://magnified.${animated ? "gif" : "png"}`);

	// test if url isn't a 404
	let validURL: boolean = false;
	let dimension: ISizeCalculationResult;
	try {
		// getDimensions also validates a url
		dimension = await getDimensions(textureURL);
		validURL = true;
	} catch (err) {
		textureURL =
			"https://raw.githubusercontent.com/Faithful-Resource-Pack/App/main/resources/transparency.png";
		embed.addFields([
			{ name: "Image not found", value: "This texture hasn't been made yet or is blacklisted!" },
		]);
		embed.setColor(colors.red);
	}

	if (validURL) {
		embed
			.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${texture.id}`)
			.addFields([
				{ name: "Resolution", value: `${dimension.width}×${dimension.height}`, inline: true },
			]);

		let mainContribution: Contribution;
		if (allContributions.length) {
			mainContribution = allContributions
				.filter((c) => strPack.includes(c.resolution.toString()) && pack === c.pack)
				.sort((a, b) => (a.date > b.date ? -1 : 1))[0];
		}

		if (mainContribution) {
			let strDate: string = `<t:${Math.trunc(mainContribution.date / 1000)}:d>`;
			let authors = mainContribution.authors.map((authorId: string) => {
				if (guild.members.cache.get(authorId)) return `<@!${authorId}>`;

				// this may possibly be one of the worst solutions but it somehow works
				for (let user of contributionJSON) {
					if (user.id == authorId) return user.username ?? "Anonymous";
				}
				return "Unknown";
			});

			const displayContribution = `${strDate} — ${authors.join(", ")}`;

			if (displayContribution != undefined) {
				embed.addFields([
					{
						name: authors.length == 1 ? "Latest Author" : "Latest Authors",
						value: displayContribution,
					},
				]);
			}
		}
	}

	embed.addFields(addPathsToEmbed(texture));

	// magnifying the texture in thumbnail
	if (animated) {
		embed.addFields([{ name: "MCMETA", value: `\`\`\`json\n${JSON.stringify(mcmeta)}\`\`\`` }]);
		files.push(
			await animateAttachment({ url: textureURL, magnify: true, name: "magnified.gif", mcmeta }),
		);
	} else files.push((await magnifyAttachment({ url: textureURL, name: "magnified.png" }))[0]);

	return [embed, files];
};
