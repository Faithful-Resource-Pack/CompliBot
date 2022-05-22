import { readFileSync } from 'fs';
import path from 'path';

const changelogOptions = () => {
  const changelogStr = readFileSync(
    path.join(__dirname, '../../', 'CHANGELOG.md').replace('dist\\', ''),
    'utf-8',
  ).replaceAll('\r', '');
  const allVersions = changelogStr.match(/(?<=## )([^]*?)(?=(\n## )|($))/g);

  const versions = [
    {
      name: `${allVersions[1].substring(1, 7)} next`,
      value: allVersions[1].substring(1, 7),
    },
    {
      name: `${allVersions[2].substring(1, 7)} current`,
      value: allVersions[2].substring(1, 7),
    },
  ];

  for (let i = 2; i < allVersions.length; i += 1) {
    versions.push({
      name: allVersions[i].substring(1, 7),
      value: allVersions[i].substring(1, 7),
    });
  }

  return versions as {
    name: string;
    value: string;
  }[];
};

export default changelogOptions;
