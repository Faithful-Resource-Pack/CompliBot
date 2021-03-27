const Canvas     = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const Discord    = require('discord.js');
const colors     = require('../res/colors');

const { getMeta }  = require('./getMeta');
const { warnUser } = require('./warnUser');

const FACTOR = 8;

async function animate(message, valMCMETA, valURL) {

	let texture = [];

	getMeta(valURL).then(async function(dimension) {
		if (dimension.width == dimension.height) return warnUser(message, 'This texture can\'t be animated.');
		if (dimension.width * FACTOR > 1024) return warnUser(message, 'This texture is too wide.');

		texture.canvas = await sizeUP(valURL, dimension);
		texture.width  = dimension.width * FACTOR;
		texture.height = dimension.height * FACTOR;

		// NOTE: Width & Height properties from MCMETA aren't supported

		let canvas  = Canvas.createCanvas(texture.width, texture.width);
		let context = canvas.getContext('2d');

		let MCMETA = typeof valMCMETA === 'object' ? valMCMETA : { animation: {} };
		if (!MCMETA.animation) MCMETA.animation = {};

		// Initialization:
		let frametime = Math.max(MCMETA.animation.frametime || 1, 1);
		let frames    = [];
		let interval;
		
		if (Array.isArray(MCMETA.animation.frames) && MCMETA.animation.frames.length > 0) {
			// If the animation should interpolate between frames or
			// if any of the frames has a duration that is not a multiple of 'frametime',
			// the animation should be updated every game tick (50ms)
			if (MCMETA.animation.interpolate || (MCMETA.animation.frames.find(e => typeof e === 'object' && e.time % frametime != 0))) interval = 1;
			else interval = frametime;
			
			// Convert frames from the MCMETA format
			for (let i = 0; i < MCMETA.animation.frames.length; i++) {
				const frame = MCMETA.animation.frames[i]

				// Default frame duration
				if (typeof frame === 'number') {
					frames.push({
						index: frame,
						duration: frametime / interval
					})
				}
				// Non-default frame duration
				else {
					frames.push({
						index: frame.index,
						duration: Math.max(frame.time, 1) / interval
					})
				}
			}
		}
		// Default frame order, no varying frame durations
		else {
			// If the animation should interpolate between frames, the animation should be updated every game tick (50ms)
			if (MCMETA.animation.interpolate) {
				interval = 1
			} else {
				interval = frametime
			}

			// Create frames
			let n = texture.height / texture.width
			for (let i = 0; i < n; i++) {
				frames.push({
					index: i,
					duration: frametime / interval
				})
			}
		}

		// Draw frames:
		const encoder = new GIFEncoder(texture.width, texture.width);
		encoder.start();

		for (let i = 0; i < frames.length; i++) {
			context.globalCompositeOperation = 'copy';
			context.globalAlpha = 1;

			// see: https://media.prod.mdn.mozit.cloud/attachments/2012/07/09/225/46ffb06174df7c077c89ff3055e6e524/Canvas_drawimage.jpg
			context.drawImage(
				texture.canvas, 										// image
				0, texture.width * frames[i].index, // sx, sy
				texture.width, texture.width,			  // sWidth, sHeight
				0, 0,															  // dx, dy
				canvas.width, canvas.height					// dWidth, dHeight
			);
	
			// If interpolation is enabled, draw the next frame with the correct opacity
			if (MCMETA.animation.interpolate) {
				context.globalCompositeOperation = 'source-over';
				context.globalAlpha = 0.5;
				context.drawImage(
					texture.canvas,																						// image
					0, texture.width * frames[(i + 1) % frames.length].index, // sx, sy
					texture.width, texture.width,															// sWidth, sHeight
					0, 0,																											// dx, dy
					canvas.width, canvas.height																// dWidth, dHeight
				);
			}
			
			encoder.setDelay(50 * interval);
			encoder.addFrame(context);
		}

		encoder.finish();

		// Send result:
		const attachment = new Discord.MessageAttachment(encoder.out.getData(), 'output.gif');
		var embed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setColor(colors.BLUE)
			.setTitle(`Animated:`)
			.setDescription(`Original size: ${dimension.width}px x ${dimension.height} px`)
			.attachFiles([attachment]);

		const embedMessage = await message.channel.send(embed);
	});
}

async function sizeUP(valURL, dimension) {
	let contextIN  = Canvas.createCanvas(dimension.width, dimension.height).getContext('2d');
	let canvasOUT  = Canvas.createCanvas(dimension.width * FACTOR, dimension.height * FACTOR);
	let contextOUT = canvasOUT.getContext('2d');

	let temp = await Canvas.loadImage(valURL);
	contextIN.drawImage(temp, 0, 0);
	let image = contextIN.getImageData(0, 0, dimension.width, dimension.height).data;

	let i, r, g, b, a;

	for (var x = 0; x < dimension.width; x++) {
		for (var y = 0; y < dimension.height; y++) {
			i = (y * dimension.width + x) * 4;
			r = image[i];
			g = image[i+1];
			b = image[i+2];
			a = image[i+3];

			if (a == 0) contextOUT.fillStyle = `rgba(54,57,63,1)`;
			else contextOUT.fillStyle = `rgba(${r},${g},${b},${a})`;
			contextOUT.fillRect(x * FACTOR, y * FACTOR, FACTOR, FACTOR);
		}
	}

	return canvasOUT;
}

exports.animate = animate;