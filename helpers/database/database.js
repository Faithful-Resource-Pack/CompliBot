const {Firestore} = require('@google-cloud/firestore');

// Create a new client
const firestore = new Firestore({
  projectId: 'compliance-pack',
  // eslint-disable-next-line no-undef
  keyFilename: __dirname + "/../../firestore.json"
})

module.exports = firestore