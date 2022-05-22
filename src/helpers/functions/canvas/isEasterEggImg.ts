import axios from 'axios';

// de funny
const gamerUrl = 'https://cdn.discordapp.com/attachments/923370825762078720/939888814028111992/grass_block_side_overlay.png';
const trolling = 'https://cdn.discordapp.com/attachments/923370825762078720/940676512368177172/unknown.png';

async function EasterEgg(url: string, id: number): Promise<Boolean> {
  switch (id) {
    case 1:
      return axios
        .get(url, {
          responseType: 'arraybuffer',
        })
        .then((response) => {
          const { data } = response;
          const buf = Buffer.from(data, 'base64').toString();
          const result = axios
            .get(gamerUrl, {
              responseType: 'arraybuffer',
            })
            .then((res) => {
              const easterEggData = res.data;
              const easterEggBuffer = Buffer.from(easterEggData, 'base64').toString();
              if (buf === easterEggBuffer) return true;
              return false;
            });
          return result;
        });
    case 2:
      return axios
        .get(url, {
          responseType: 'arraybuffer',
        })
        .then((response) => {
          const { data } = response;
          const buf = Buffer.from(data, 'base64').toString();
          const result = axios
            .get(trolling, {
              responseType: 'arraybuffer',
            })
            .then((res) => {
              const easterEggData = res.data;
              const easterEggBuffer = Buffer.from(easterEggData, 'base64').toString();
              if (buf === easterEggBuffer) return true;
              return false;
            });
          return result;
        });

    default:
      break;
  }
}
export default EasterEgg;
