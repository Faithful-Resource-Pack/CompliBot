import { EmbedBuilder } from "@client";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import ColorManager from "@images/colors";
import getDimensions from "./getDimensions";

export enum mcColors {
	Foliage = "#5BAB46",
	FoliageCold = "#60A17B",
	FoliageHot = "#1ABF00",
	FoliageDry = "#AEA42A",
	Grass = "#7CBD6B",
	GrassCold = "#80B497",
	GrassHot = "#47CD33",
	GrassDry = "#BFB755",
	DyeWhite = "#F9FFFE",
	DyeOrange = "#F9801D",
	DyeMagenta = "#C74EBD",
	DyeLightBlue = "#3AB3DA",
	DyeYellow = "#FED83D",
	DyeLime = "#80C71F",
	DyePink = "#F38BAA",
	DyeGray = "#474F52",
	DyeLightgray = "#9D9D97",
	DyeCyan = "#169C9C",
	DyePurple = "#8932B8",
	DyeBlue = "#3C44AA",
	DyeBrown = "#835432",
	DyeGreen = "#5E7C16",
	DyeRed = "#B02E26",
	DyeBlack = "#1D1D21",
}

export const mcColorsOptions: { name: string; value: string }[] = Object.keys(mcColors).map(
	(name) => {
		//a cheeky regex for formatting
		return {
			name: name.replace(/([a-z])([A-Z])/g, "$1 $2"),
			value: mcColors[name as keyof typeof mcColors],
		};
	},
);

type options = {
	url: string;
	embed?: EmbedBuilder;
	name?: string;
	color: string;
};

export async function multiplyAttachment(
	options: options,
): Promise<[AttachmentBuilder, EmbedBuilder]> {
	const dimension = await getDimensions(options.url);
	const canvas = createCanvas(dimension.width, dimension.height);
	const context = canvas.getContext("2d");

	context.imageSmoothingEnabled = false;
	const imageToDraw = await loadImage(options.url as string);

	context.drawImage(imageToDraw, 0, 0, dimension.width, dimension.height);
	context.globalCompositeOperation = "multiply";

	context.fillStyle = options.color;
	context.fillRect(0, 0, dimension.width, dimension.height);

	const data = context.getImageData(0, 0, dimension.width, dimension.height);

	for (let i = 0; i < data.data.length; i += 4) {
		const red = data.data[i];
		const green = data.data[i + 1];
		const blue = data.data[i + 2];

		const hex = new ColorManager({ rgb: { r: red, g: green, b: blue } }).toHEX().value;
		if (hex.toUpperCase() == options.color.substring(1)) {
			data.data[i + 3] = 0;
		}
	}

	context.putImageData(data, 0, 0);

	return [
		new AttachmentBuilder(canvas.toBuffer("image/png"), {
			name: `${options.name || "tinted.png"}`,
		}),
		options.embed,
	];
}
