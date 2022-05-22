/**
 * Add minutes to a date
 * @param {Date} d - the date to add minutes to
 * @param {Number} minutes - the number of minutes to add
 * @returns {Date} - the new date
 */
export const addMinutes = (d: Date, minutes?: number): Date => {
  if (minutes === null || minutes === undefined) minutes = 1;
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};

/**
 * Add seconds to a date
 * @param {Date} d - the date to add seconds to
 * @param {Number} seconds - the number of seconds to add
 * @returns {Date} - the new date
 */
export const addSeconds = (d: Date, seconds?: number): Date => {
  if (seconds === null || seconds === undefined) seconds = 1;
  d.setSeconds(d.getSeconds() + seconds);
  return d;
};

/**
 * Parse user input into seconds
 * @param {String} d - user input
 * @returns {Number} - equivalent in seconds
 */
export const parseDate = (d: string): number => {
  if ((d.endsWith('y') && !d.endsWith('day')) || d.endsWith('year') || d.endsWith('years')) return parseInt(d, 10) * 24 * 3600 * 365;
  if (d.endsWith('m') || d.endsWith('month') || d.endsWith('months')) return parseInt(d, 10) * 30 * 24 * 3600;
  if (d.endsWith('w') || d.endsWith('week') || d.endsWith('weeks')) return parseInt(d, 10) * 7 * 86400;
  if (d.endsWith('d') || d.endsWith('day') || d.endsWith('days')) return parseInt(d, 10) * 86400;
  if (d.endsWith('h') || d.endsWith('hours') || d.endsWith('hour')) return parseInt(d, 10) * 3600;
  if (d.endsWith('min') || d.endsWith('minute') || d.endsWith('minutes')) return parseInt(d, 10) * 60;
  if (d.endsWith('s') || d.endsWith('second') || d.endsWith('seconds')) return parseInt(d, 10);

  return parseInt(d, 10); // default value is considered to be seconds
};

/**
 * Convert timestamp to human readable format
 * -> 1028193718 = 10/28/1937
 * @param {String} t - timestamp to convert
 * @returns {String} - human readable format
 */
export const fromTimestampToHumanReadable = (t: number): string => {
  if (t === undefined) return '01/01/1970';

  const date = new Date(parseInt(t.toString(), 10)); // cast to int because it might be a string
  return `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/${
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  }/${date.getFullYear()}`;
};
