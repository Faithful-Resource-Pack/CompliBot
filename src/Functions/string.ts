import { readFileSync } from 'fs';
import path from 'path';
import { unhandledRejection } from './unhandledRejection';

export type key = 'Error.General' | 'Error.NotFound' | 'Error.DevBad' | 'InvalidArgs' | 'InsufficientArgs';

export function string(countryCode: string, string: key): string {
	try {
		const data = readFileSync(path.join(__dirname, `../../lang/${countryCode}.lang`), 'utf-8');
		let map: { [key: string]: key } = data.split(/\r?\n/).reduce((obj, line) => {
			let cols = line.split(':');
			if (cols.length >= 2) {
				obj[cols[0]] = cols[1];
			}
			return obj;
		}, {});

		if (Object.keys(map).filter((key) => key == string) != undefined) return map[string];
		else return `not added to \`${countryCode}.lang\` yet!`;
	} catch (error) {
		Promise.reject(error);
	}
	return undefined;
}
