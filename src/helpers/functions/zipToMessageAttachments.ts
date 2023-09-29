import axios from "axios";
import { AttachmentBuilder } from "discord.js";
import JSZip from "jszip";

export const zipToMA = async (url: string): Promise<AttachmentBuilder[]> => {
	let output: AttachmentBuilder[] = [];

	// get zip as arraybuffer
	const zip: ArrayBuffer = (
		await axios({
			url: url,
			method: "GET",
			responseType: "arraybuffer",
		})
	).data;

	// get files inside the zip as an object: { "filename": "Buffer" }
	const zipFiles: { [key: string]: Buffer } = await JSZip.loadAsync(arrayBufferToBufferCycle(zip))
		.then((zip) => {
			const ext = /(.png|.tga)$/;
			let promises = Object.keys(zip.files)
				.filter((filename) => ext.test(filename.toLowerCase()))
				.map(async (filename) => {
					let file = zip.files[filename];
					return file.async("nodebuffer").then((buffer: Buffer) => {
						return [filename, buffer];
					});
				});

			return Promise.all(promises);
		})
		.then((res): { [key: string]: Buffer } => {
			return res.reduce((acc, val: [key: string, buff: Buffer]) => {
				const splitted = val[0].split("/");
				const key = splitted[splitted.length - 1];
				acc[key] = val[1];
				return acc;
			}, {});
		});

	// convert to AttachmentBuilder
	Object.keys(zipFiles).forEach((key: string) => {
		output.push(new AttachmentBuilder(zipFiles[key], { name: key }));
	});

	return output;
};

const arrayBufferToBufferCycle = (ab: ArrayBuffer): Buffer => {
	let buffer = Buffer.alloc(ab.byteLength);
	let view = new Uint8Array(ab);

	for (let i = 0; i < buffer.length; ++i) buffer[i] = view[i];

	return buffer;
};
