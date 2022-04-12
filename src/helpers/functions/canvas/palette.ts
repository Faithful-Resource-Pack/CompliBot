import { MessageEmbed } from "@client";
import { Canvas, createCanvas, loadImage } from "canvas";
import { MessageAttachment } from "discord.js";
import { ColorManager } from "./colors";
import getMeta from "./getMeta";

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

export interface options {
	url: string;
	name: string;
}

export interface AllColors {
	[key: string]: {
		hex: string;
		opacity: Array<number>;
		rgb: [r: number, g: number, b: number];
		count: number;
	};
}

export async function paletteAttachment(options: options): Promise<[MessageAttachment, MessageEmbed]> {
	return getMeta(options.url).then(async (dimension) => {
		const [width, height] = [dimension.width, dimension.height];
		const size = width * height;
		if (size > 262144) return [null, new MessageEmbed()];

		const canvas: Canvas = createCanvas(width, height);
		const context = canvas.getContext("2d");
		const allColors: AllColors = {};

		const imageToDraw = await loadImage(options.url);
		context.drawImage(imageToDraw, 0, 0, width, height);

		const imageData = context.getImageData(0, 0, width, height).data;

		for (let x = 0; x < dimension.width; x++)
			for (let y = 0; y < dimension.height; y++) {
				let index = (y * dimension.width + x) * 4;
				let r = imageData[index];
				let g = imageData[index + 1];
				let b = imageData[index + 2];
				let a = imageData[index + 3] / 255;

				// avoid transparent colors
				if (a !== 0) {
					var hex = new ColorManager({ rgb: { r: r, g: g, b: b } }).toHEX().value;

					if (!(hex in allColors)) allColors[hex] = { hex: hex, opacity: [], rgb: [r, g, b], count: 0 };

					++allColors[hex].count;
					allColors[hex].opacity.push(a);
				}
			}

		// convert back to array
		let colors = Object.values(allColors)
			.sort((a, b) => b.count - a.count)
			.slice(0, COLORS_TOP)
			.map((el) => el.hex);

		const embed = new MessageEmbed().setTitle("Palette results").setDescription("List of colors:\n");

		const field_groups = [];
		let g: number;
		for (let i = 0; i < colors.length; i++) {
			// create 9 groups
			if (i % COLORS_PER_PALETTE === 0) {
				field_groups.push([]);
				g = 0;
			}

			// each group has 3 lines
			if (g % COLORS_PER_PALETTE_LINE === 0) field_groups[field_groups.length - 1].push([]);

			// add color to latest group at the latest line
			field_groups[field_groups.length - 1][field_groups[field_groups.length - 1].length - 1].push(colors[i]);
			++g;
		}

		let groupValue;
		field_groups.forEach((group, index) => {
			groupValue = group
				.map((line) => line.map((color) => `[\`#${color}\`](${COOLORS_URL}${color})`).join(" "))
				.join(" ");
			embed.addFields({
				name: "Hex" + (field_groups.length > 1 ? ` part ${index + 1}` : "") + ": ",
				value: groupValue,
				inline: true,
			});
		});

		// create palette links, 9 max par link
		// make arrays of hex arrays
		const palette_groups = [];
		for (let i = 0; i < colors.length; ++i) {
			if (i % COLORS_PER_PALETTE === 0) palette_groups.push([]);
			palette_groups[palette_groups.length - 1].push(colors[i]);
		}

		// create URLs
		const palette_urls: Array<string> = [];
		let descriptionLen: number = embed.description.length;

		let i: number = 0;
		let stayInLoop: boolean = true;
		let link: string;

		while (i < palette_groups.length && stayInLoop) {
			link = `**[Palette${palette_groups.length > 1 ? " part " + (i + 1) : ""}](${COOLORS_URL}${palette_groups[i].join(
				"-",
			)})**`;

			if (descriptionLen + link.length + 3 > 1024) stayInLoop = false;
			else {
				palette_urls.push(link);
				descriptionLen += link.length;
			}

			++i;
		}

		// add generate palette link && append palette to description
		embed.setDescription(
			`Total: ${Object.values(allColors).length}\n\n` + embed.description + palette_urls.join(" - "),
		);

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
				let [ha, sa, la] = Object.values(new ColorManager({ rgb: { r: a.rgb[0], g: a.rgb[1], b: a.rgb[2] } }).toHSL());
				let [hb, sb, lb] = Object.values(new ColorManager({ rgb: { r: b.rgb[0], g: b.rgb[1], b: b.rgb[2] } }).toHSL());

				if (sa <= GRADIENT_SAT_THRESHOLD && sb > GRADIENT_SAT_THRESHOLD) return -1;
				if (sa > GRADIENT_SAT_THRESHOLD && sb <= GRADIENT_SAT_THRESHOLD) return 1;
				if (sa <= GRADIENT_SAT_THRESHOLD && sb <= GRADIENT_SAT_THRESHOLD) return la > lb ? 1 : -(la < lb);
				if (Math.abs(ha - hb) > GRADIENT_HUE_DIFF) return ha > hb ? 1 : -(ha < hb);

				return la > lb ? 1 : -(la < lb);
			});

		const colorCanvas = createCanvas(bandWidth * allColorsSorted.length, GRADIENT_HEIGHT);
		const ctx = colorCanvas.getContext("2d");

		allColorsSorted.forEach((color, index) => {
			ctx.fillStyle = `#${color.hex}`;
			ctx.globalAlpha = color.opacity.reduce((a, v, i) => (a * i + v) / (i + 1)); // average alpha
			ctx.fillRect(bandWidth * index, 0, bandWidth, GRADIENT_HEIGHT);
		});

		const attachment = new MessageAttachment(
			colorCanvas.toBuffer("image/png"),
			`${options.name ? options.name : "palette.png"}`,
		);
		return [attachment, embed];
	});
}
