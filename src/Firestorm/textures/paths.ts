import firestorm from 'firestorm-db';
import config from '../config';
config();

import uses from './uses';

export default firestorm.collection('paths', el => {
  el.use = () => {
    return uses.get(el.useID)
  }

  el.texture = () => {
    return new Promise((resolve, reject) => {
      el.use()
        .then(use => {
          return resolve(use.texture())
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  el.edition = () => {
    return uses.get(el.useID).then(use => use.editions[0])
  }

  return el;
})