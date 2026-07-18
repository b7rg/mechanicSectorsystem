export function getLevel(rank: string) {
  const number = Number(rank.replace("G-", ""));

  if (number >= 271 && number <= 285) return 1;
  if (number >= 221 && number <= 235) return 2;
  if (number >= 166 && number <= 180) return 3;
  if (number >= 126 && number <= 135) return 4;
  if (number >= 96 && number <= 107) return 5;
  if (number >= 70 && number <= 79) return 6;
  if (number >= 51 && number <= 60) return 7;
  if (number >= 26 && number <= 35) return 8;

  return 0;
}