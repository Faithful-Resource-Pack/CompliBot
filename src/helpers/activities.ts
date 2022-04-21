// thanks ewanhowell5195 for these types! - nick#1666
export enum activities {
	betrayal = "773336526917861400",
	checkers = "832013003968348200",
	chess = "832012774040141894",
	fishington = "814288819477020702",
	letterleague = "879863686565621790",
	ocho = "832025144389533716",
	pokernight = "755827207812677713",
	sketchheads = "902271654783242291",
	spellcast = "852509694341283871",
	wordsnacks = "879863976006127627",
	youtube = "880218394199220334",
}
export const activityOptions: [name: string, value: string][] = Object.keys(activities).map((name) => {
	return [name, activities[name as keyof typeof activities]];
});
