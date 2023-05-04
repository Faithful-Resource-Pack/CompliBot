export const ids = {
  bug: '959344133145755648',
  suggestion: '959344133158350869',
  view_votes: '949830600125194281',
  planet_mc: '863132124333080576',
  curseforge: '863132124306472980',
  f32_logo: '963455577630064741',
  f64_logo: '963455576690556998',
  dungeons_logo: '963455576649905890',
  extras_logo: '963455575520342016',
  mods_logo: '963455576833138720',
  faithful_logo: '963455577105788959',
  tweaks_logo: '963455577453887518',
  addons_logo: '963455574656286750',
  magnify: '918186631226339339',
  invalid: '918186621323579433',
  instapass: '918186611794137168',
  see_less: '918186673496543242',
  see_more: '918186683055349810',
  palette: '918186650822131742',
  upvote: '918186701975859307',
  downvote: '918186603007078420',
  delete: '1103485671903076403',
  compare: '918186583176405032',
  tile: '918186692307996723',
  next_res: '918186640571256842',
  pending: '918186662780092537',
  flip_tiling: '942014073141334056',
  rotate_tiling: '942014072818376716',
} as const;

export function parseId(id: string): string {
  return `<:${Object.keys(ids).find((key) => ids[key] === id)}:${id}>`;
}

export const choiceEmojis: string[] = [
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
  '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴',
];

export type Emoji = keyof typeof ids;
