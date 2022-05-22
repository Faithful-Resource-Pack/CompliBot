/**
 * Sort Minecraft Version Numbers
 * Use this function as a filter for the sort() method:
 * [].sort(MinecraftSorter)
 */
const MinecraftSorter: any = (a: string, b: string) => {
  const A = a.split('.').map((s) => parseInt(s, 10));
  const B = b.split('.').map((s) => parseInt(s, 10));

  const upper = Math.min(A.length, B.length);
  let i = 0;
  let res = 0;

  while (i < upper && res === 0) {
    // eslint-disable-next-line no-nested-ternary
    res = A[i] === B[i] ? 0 : A[i] < B[i] ? -1 : 1; // each number
    i += 1;
  }

  if (res !== 0) return res;
  // eslint-disable-next-line no-nested-ternary
  return A.length === B.length ? 0 : A.length < B.length ? -1 : 1; // longer length wins
};

export default MinecraftSorter;
