const all = require('./all')

let texturePath, textureUses;
all.texture_path.search([{
  field: "edition",
  criteria: "==",
  value: "java"
}, {
  "field": "versions",
  "criteria": "array-contains-any",
  "value": ["1.16.210", "1.16.200"]
}])
.then(results => {
  texturePath = results

  let textureUseArray =texturePath.map(path => path.useID)
  textureUseArray = textureUseArray.filter((useID, index) => textureUseArray.indexOf(useID) === index)

  return all.texture_use.searchKeys(textureUseArray)
}).then(results => {
  textureUses = results

  let textureUseAdd = []
  texturePath.forEeach(path => {
    textureUseAdd.push({
      texureID: textureUses.filter(tu => tu.id === path.useID),
      textureUseName: "",
      edition: "bedrock"
    })
  })

  console.log(textureUseAdd)
}).catch(err => {
  console.error(err)
})