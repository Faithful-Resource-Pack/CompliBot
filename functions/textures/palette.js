const { createCanvas, loadImage } = require("@napi-rs/canvas");
const settings = require("../../resources/settings.json");
const strings = require("../../resources/strings.json");

const { MessageEmbed, MessageAttachment } = require("discord.js");
const getDimensions = require("./getDimensions");

const COLORS_PER_PALETTE = 9;
const COLORS_PER_PALETTE_LINE = 3;

const COLORS_TOP = COLORS_PER_PALETTE * 6;

const GRADIENT_TOP = 250;
const GRADIENT_SAT_THRESHOLD = 15 / 100;
const GRADIENT_HUE_DIFF = 13 / 100;
const GRADIENT_WIDTH = 700;
const GRADIENT_BAND_WIDTH = 3;
const GRADIENT_HEIGHT = 50;

/**
 * Get the color palette from an image url ephemerally
 * @author Juknum
 * @param {DiscordInteraction} interaction discord interaction to respond to
 * @param {String} url Image URL
 * @returns Send an embed message with the color palette of the given URL
 */
module.exports = async function palette(interaction, url) {
	const dimension = await getDimensions(url);
	const sizeOrigin = dimension.width * dimension.height;

	if (sizeOrigin > 262144)
		return await interaction.reply({ content: strings.command.image.too_big, ephemeral: true });

	let canvas = createCanvas(dimension.width, dimension.height).getContext("2d");
	const allColors = {};

	const temp = await loadImage(url);
	canvas.drawImage(temp, 0, 0);

	let image = canvas.getImageData(0, 0, dimension.width, dimension.height).data;

	let index, r, g, b, a;
	let x, y;

	for (x = 0; x < dimension.width; x++) {
		for (y = 0; y < dimension.height; y++) {
			index = (y * dimension.width + x) * 4;
			r = image[index];
			g = image[index + 1];
			b = image[index + 2];
			a = image[index + 3] / 255;

			// avoid transparent colors
			if (a) {
				let hex = rgbToHex(r, g, b);
				if (!(hex in allColors))
					allColors[hex] = { hex: hex, opacity: [], rgb: [r, g, b], count: 0 };
				++allColors[hex].count;
				allColors[hex].opacity.push(a);
			}
		}
	}
	// convert back to array
	let colors = Object.values(allColors)
		.sort((a, b) => b.count - a.count)
		.slice(0, COLORS_TOP);
	colors = colors.map((el) => el.hex);

	// object trick so no duplicates

	const embed = new MessageEmbed()
		.setTitle("Palette results")
		.setColor(settings.colors.blue)
		.setDescription(`List of colors:\n`)
		.setFooter({ text: `Total: ${Object.values(allColors).length}` });

	const field_groups = [];
	let i;
	for (i = 0; i < colors.length; i++) {
		// create 9 group
		if (i % COLORS_PER_PALETTE === 0) {
			field_groups.push([]);
			g = 0;
		}

		// each groups has 3 lines
		if (g % COLORS_PER_PALETTE_LINE === 0) {
			field_groups[field_groups.length - 1].push([]);
		}

		// add color to latest group latest line
		field_groups[field_groups.length - 1][field_groups[field_groups.length - 1].length - 1].push(
			colors[i],
		);

		++g;
	}

	let groupValue;
	field_groups.forEach((group, index) => {
		groupValue = group
			.map((line) =>
				line
					.map((color) => `[\`${color}\`](https://coolors.co/${color.replace("#", "")})`)
					.join(" "),
			)
			.join(" ");
		embed.addFields({
			name: "Hex" + (field_groups.length > 1 ? ` part ${index + 1}` : "") + ": ",
			value: groupValue,
			inline: true,
		});
	});

	// create palette links, 9 max per link

	// make arrays of hex arrays
	const palette_groups = [];
	for (i = 0; i < colors.length; ++i) {
		if (i % COLORS_PER_PALETTE === 0) {
			palette_groups.push([]);
		}
		palette_groups[palette_groups.length - 1].push(colors[i].replace("#", ""));
	}

	// create urls
	const COOLORS_URL = "https://coolors.co/";
	const palette_urls = [];
	let descriptionLength = embed.description.length;

	i = 0;
	let stayInLoop = true;
	let link;
	while (i < palette_groups.length && stayInLoop) {
		link = `**[Palette${
			palette_groups.length > 1 ? " part " + (i + 1) : ""
		}](${COOLORS_URL}${palette_groups[i].join("-")})** `;

		if (descriptionLength + link.length + 3 > 1024) {
			stayInLoop = false;
		} else {
			palette_urls.push(link);
			descriptionLength += link.length;
		}
		++i;
	}

	// add generate palette links
	const finalDescription = embed.description + palette_urls.join(" - ");

	// append palettes to description
	embed.setDescription(finalDescription);

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
			let [ha, sa, la] = rgbToHsl(a.rgb[0], a.rgb[1], a.rgb[2]);
			let [hb, sb, lb] = rgbToHsl(b.rgb[0], b.rgb[1], b.rgb[2]);

			if (sa <= GRADIENT_SAT_THRESHOLD && sb > GRADIENT_SAT_THRESHOLD) return -1;
			else if (sa > GRADIENT_SAT_THRESHOLD && sb <= GRADIENT_SAT_THRESHOLD) return 1;
			else if (sa <= GRADIENT_SAT_THRESHOLD && sb <= GRADIENT_SAT_THRESHOLD) {
				return la > lb ? 1 : -(la < lb);
			} else if (Math.abs(ha - hb) > GRADIENT_HUE_DIFF) return ha > hb ? 1 : -(ha < hb);
			return la > lb ? 1 : -(la < lb);
		});

	const canvasWidth = bandWidth * allColorsSorted.length;
	const colorCanvas = createCanvas(canvasWidth, GRADIENT_HEIGHT);
	const ctx = colorCanvas.getContext("2d");

	allColorsSorted.forEach((color, index) => {
		ctx.fillStyle = color.hex;
		ctx.globalAlpha = color.opacity.reduce((a, v, i) => (a * i + v) / (i + 1)); // average alpha
		ctx.fillRect(bandWidth * index, 0, bandWidth, GRADIENT_HEIGHT);
	});

	// create the attachement
	const colorImageAttachment = new MessageAttachment(
		colorCanvas.toBuffer("image/png"),
		"colors.png",
	);

	return await interaction.reply({
		embeds: [embed],
		files: [colorImageAttachment],
		ephemeral: true,
	});
};

function rgbToHex(r, g, b) {
	return (
		"#" +
		((r | (1 << 8)).toString(16).slice(1) +
			(g | (1 << 8)).toString(16).slice(1) +
			(b | (1 << 8)).toString(16).slice(1))
	);
}

/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param {Number} r The red color value
 * @param {Number} g The green color value
 * @param {Number} b The blue color value
 * @return {Number[]} The HSL representation
 */
function rgbToHsl(r, g, b) {
	(r /= 255), (g /= 255), (b /= 255);

	let max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h,
		s,
		l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h /= 6;
	}

	return [h, s, l];
}
