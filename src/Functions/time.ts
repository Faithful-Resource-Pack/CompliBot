export function stringToMs(text: string) {
    let ms = 0;
    const seconds = /(\d+)\s?(s|sec|seconds?)/.exec(text);
    if (seconds) ms += Number(seconds[1]) * 1000;

    const minutes = /(\d+)\s?(m|min|minutes?)/.exec(text);
    if (minutes) ms += Number(minutes[1]) * 1000 * 60;

    const hours = /(\d+)\s?(h|hrs|hours?)/.exec(text);
    if (hours) ms += Number(hours[1]) * 1000 * 60 * 60;

    const days = /(\d+)\s?(d|days?)/.exec(text);
    if (days) ms += Number(days[1]) * 1000 * 60 * 60 * 24;

    const weeks = /(\d+)\s?(w|weeks?)/.exec(text);
    if (weeks) ms += Number(weeks[1]) * 1000 * 60 * 60 * 24 * 7;

    const months = /(\d+)\s?(mon|months?)/.exec(text);
    if (months) ms += Number(months[1]) * 1000 * 60 * 60 * 24 * 30;

    const years = /(\d+)\s?(y|years?)/.exec(text);
    if (years) ms += Number(years[1]) * 1000 * 60 * 60 * 24 * 365;

    return ms;
}