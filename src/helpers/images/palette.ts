import { EmbedBuilder } from "@client";
import { ImageData, createCanvas, loadImage } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import ColorManager from "@images/colors";
import { ImageSource } from "@images/getImage";

const COOLORS_URL = "https://coolors.co/";

const COLORS_PER_PALETTE = 9;
const COLORS_PER_PALETTE_LINE = 3;
const COLORS_TOP = COLORS_PER_PALETTE * 6;

const GRADIENT_TOP = 250;
const GRADIENT_SAT_THRESHOLD = 15 / 100;
const GRADIENT_HUE_DIFF = 13 / 100;
const GRADIENT_WIDTH = 700;
const GRADIENT_BAND_WIDTH = 3;
const GRADIENT_HEIGHT = 50;

export interface AllColors {
	[key: string]: {
		hex: string;
		opacity: number[];
		rgb: [r: number, g: number, b: number];
		count: number;
	};
}

/**
 * Create a palette of colors and additional information for a given image
 * @author Juknum, Evorp
 * @param origin image to find palette of
 * @returns embed and attachment
 */
export async function palette(origin: ImageSource) {
	const imageToDraw = await loadImage(origin);
	// 1048576px is the same size as a magnified image
	if (imageToDraw.width * imageToDraw.height > 1048576) return { image: null, embed: null };
	const canvas = createCanvas(imageToDraw.width, imageToDraw.height);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(imageToDraw, 0, 0);

	const allColors: AllColors = {};
	const imageData: ImageData = ctx.getImageData(0, 0, imageToDraw.width, imageToDraw.height).data;

	for (let x = 0; x < imageToDraw.width; ++x) {
		for (let y = 0; y < imageToDraw.height; ++y) {
			const index = (y * imageToDraw.width + x) * 4;
			const r = imageData[index];
			const g = imageData[index + 1];
			const b = imageData[index + 2];
			const a = imageData[index + 3] / 255;

			// avoid transparent colors
			if (!a) continue;
			const hex = new ColorManager({ rgb: { r, g, b } }).toHEX().value;

			if (!(hex in allColors)) allColors[hex] = { hex, opacity: [], rgb: [r, g, b], count: 0 };

			++allColors[hex].count;
			allColors[hex].opacity.push(a);
		}
	}

	// convert back to array
	const colors = Object.values(allColors)
		.sort((a, b) => b.count - a.count)
		.slice(0, COLORS_TOP)
		.map((el) => el.hex);

	const embed = new EmbedBuilder()
		.setTitle("Palette results")
		.setDescription(`Total: ${Object.keys(allColors).length}`);

	const fieldGroups: string[][][] = [];
	let group: number;
	for (let i = 0; i < colors.length; ++i) {
		// create 9 groups
		if (i % COLORS_PER_PALETTE === 0) {
			fieldGroups.push([]);
			group = 0;
		}

		// each group has 3 lines
		if (group % COLORS_PER_PALETTE_LINE === 0) fieldGroups.at(-1).push([]);

		// add color to latest group at the latest line
		fieldGroups.at(-1)[fieldGroups[fieldGroups.length - 1].length - 1].push(colors[i]);
		++group;
	}

	fieldGroups.forEach((group, index) => {
		const groupValue = group
			.map((line: string[]) =>
				line.map((color: string) => `[\`#${color}\`](${COOLORS_URL}${color})`).join(" "),
			)
			.join(" ");

		embed.addFields({
			name: "Hex" + (fieldGroups.length > 1 ? ` part ${index + 1}` : "") + ": ",
			value: groupValue,
			inline: true,
		});
	});

	// create palette links, 9 max par link
	// make arrays of hex arrays
	const paletteGroups: string[][] = [];
	for (let i = 0; i < colors.length; ++i) {
		if (i % COLORS_PER_PALETTE === 0) paletteGroups.push([]);
		paletteGroups.at(-1).push(colors[i]);
	}

	// create URLs
	const paletteUrls: string[] = [];
	let groupLength = 0;

	for (let i = 0; i < paletteGroups.length; ++i) {
		const link = `**[Palette${
			paletteGroups.length > 1 ? " part " + (i + 1) : ""
		}](${COOLORS_URL}${paletteGroups[i].join("-")})**`;

		if (groupLength + link.length + 3 > 1024) break;

		paletteUrls.push(link);
		groupLength += link.length;
	}

	// add field at top
	embed.spliceFields(0, 0, {
		name: "List of colors:",
		value: paletteUrls.join(" - "),
		inline: false,
	});

	// create gradient canvas for top GRADIENT_TOP colors
	const bandWidth =
		Object.values(allColors).length > GRADIENT_TOP
			? GRADIENT_BAND_WIDTH
			: Math.floor(GRADIENT_WIDTH / Object.values(allColors).length);

	// compute width
	const allColorsSorted = Object.values(allColors)
		.sort((a, b) => b.count - a.count)
		.slice(0, GRADIENT_TOP)
		.sort((a, b) => {
			const [ha, sa, la] = Object.values(
				new ColorManager({ rgb: { r: a.rgb[0], g: a.rgb[1], b: a.rgb[2] } }).toHSL(),
			);
			const [hb, sb, lb] = Object.values(
				new ColorManager({ rgb: { r: b.rgb[0], g: b.rgb[1], b: b.rgb[2] } }).toHSL(),
			);

			if (sa <= GRADIENT_SAT_THRESHOLD && sb > GRADIENT_SAT_THRESHOLD) return -1;
			if (sa > GRADIENT_SAT_THRESHOLD && sb <= GRADIENT_SAT_THRESHOLD) return 1;
			if (sa <= GRADIENT_SAT_THRESHOLD && sb <= GRADIENT_SAT_THRESHOLD)
				return la > lb ? 1 : -(la < lb);
			if (Math.abs(ha - hb) > GRADIENT_HUE_DIFF) return ha > hb ? 1 : -(ha < hb);

			return la > lb ? 1 : -(la < lb);
		});

	const colorCanvas = createCanvas(bandWidth * allColorsSorted.length, GRADIENT_HEIGHT);
	const colorCtx = colorCanvas.getContext("2d");

	allColorsSorted.forEach((color, index) => {
		colorCtx.fillStyle = `#${color.hex}`;
		colorCtx.globalAlpha = color.opacity.reduce((acc, val, i) => (acc * i + val) / (i + 1)); // average alpha
		colorCtx.fillRect(bandWidth * index, 0, bandWidth, GRADIENT_HEIGHT);
	});

	return { image: colorCanvas.toBuffer("image/png"), embed };
}

/**
 * Get the color palette of an image
 * @author Evorp
 * @param origin image to find palette of
 * @param name attachment name
 * @returns sendable attachment and data
 */
export async function paletteToAttachment(
	origin: ImageSource,
	name = "palette.png",
): Promise<[AttachmentBuilder, EmbedBuilder]> {
	const { image, embed } = await palette(origin);
	// too big
	if (!image || !embed) return [null, null];
	return [new AttachmentBuilder(image, { name }), embed];
}
