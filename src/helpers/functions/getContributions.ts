import { Client } from "@client";
import type { Contribution, Texture } from "@interfaces/database";
import formatPack from "@utility/formatPack";
import axios from "axios";
import { User } from "discord.js";

export interface ContributionResult {
	results: (Contribution & Texture)[];
	count: string;
	file?: Buffer;
}

// schema for sorting textures
const PACK_ORDER = [
	"faithful_32x",
	"faithful_64x",
	"classic_faithful_32x",
	"classic_faithful_64x",
	"classic_faithful_32x_jappa",
	"classic_faithful_64x_jappa",
];

const sortMethods: Record<
	string,
	(a: Contribution & Texture, b: Contribution & Texture) => number
> = {
	dateDesc: (a, b) => b.date - a.date,
	dateAsc: (a, b) => a.date - b.date,
	idDesc: (a, b) => Number(b.id) - Number(a.id),
	idAsc: (a, b) => Number(a.id) - Number(b.id),
	pack: (a, b) => PACK_ORDER.indexOf(a.pack) - PACK_ORDER.indexOf(b.pack),
};

const deduplicateContributions = (contributions: Contribution[]) =>
	Object.values(
		contributions.reduce<Record<string, Contribution>>((acc, cur) => {
			const old = acc[cur.texture];
			// new date wins
			if (!old || old.date < cur.date) acc[cur.texture] = cur;
			return acc;
		}, {}),
	);

const filterLatestContributions = (contributions: Contribution[]) =>
	Object.values(Object.groupBy(contributions, ({ pack }) => pack)).flatMap(
		deduplicateContributions,
	);

/**
 * Get contributions for a given user and pack
 * @author Evorp
 * @param client Client to search with
 * @param user User to get contributions for
 * @param pack Filter by pack (default all)
 * @returns Contribution data and Text file
 */
export default async function getContributions(
	client: Client,
	user: User,
	pack: string | null,
	current: boolean,
	sort: string,
): Promise<ContributionResult> {
	let contributionData: Contribution[] = [];
	try {
		contributionData = Object.values(
			(await axios.get<Contribution[]>(`${client.tokens.apiUrl}contributions/raw`)).data,
		);
	} catch {
		return;
	}

	const baseData = current ? filterLatestContributions(contributionData) : contributionData;
	const withPack = pack ? baseData.filter((c) => c.pack === pack) : baseData;
	const withUser = withPack.filter((contrib) => contrib.authors.includes(user.id));

	const textures = (await axios.get<Record<string, Texture>>(`${client.tokens.apiUrl}textures/raw`))
		.data;

	// merge the two objects by id (faster than fetching individually)
	const results: (Contribution & Texture)[] = withUser.map((contribution) => ({
		...contribution,
		...textures[contribution.texture],
	}));

	const packCount: Record<string, number> = {};
	const file = Buffer.from(
		results
			.sort(sortMethods[sort]) // most recent on top
			.map((data) => {
				const packName = formatPack(data.pack).name;
				packCount[packName] ||= 0;
				++packCount[packName];
				return pack
					? `[#${data.texture}] ${data.name}`
					: `${packName}: [#${data.texture}] ${data.name}`;
			})
			// gives empty string if no results
			.join("\n"),
	);

	return {
		results,
		file,
		count: Object.entries(packCount)
			.map((i) => i.join(": "))
			.join("\n"),
	};
}
