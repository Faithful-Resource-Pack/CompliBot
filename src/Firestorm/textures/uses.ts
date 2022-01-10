import firestorm from 'firestorm-db';
import config from '../config';
config();

import textures from '.';
import paths from './paths';

export default firestorm.collection('uses', el => {
  el.texture = () => {
    return textures.get(el.textureID);
  }

  el.paths = () => {
    return paths.search([{
      field: 'useID',
      criteria: '==',
      value: el[firestorm.ID_FIELD]
    }])
  }

  return el;
})