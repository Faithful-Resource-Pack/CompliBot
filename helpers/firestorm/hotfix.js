const firestorm = require('./index')
const all = require('./all')

const up = all.texture_use.read_raw()
const tpp = all.texture_path.read_raw()

Promise.all([up, tpp])
.then(arr => {
  /** @type {import('./texture_use').TextureUse[]} */
  const uses = arr[0]

  let paths = arr[1]
  paths = Object.values(paths)  

  let editionObj
  uses.forEach((use, index) => {
    editionObj =  {}

    const usePaths = paths.filter(p => p.useID == index)

    usePaths.forEach(path => {
      editionObj[path.edition] = 1

      Object.values(path.versions).forEach(v => {
        if([
          "1.17",
          "1.16.5",
          "1.15.2",
          "1.14.4",
          "1.13.2",
          "1.12.2"
        ].includes(v))
          editionObj['java'] = 1

        if(["1.16.210", "1.16.200"].includes(v))
          editionObj["bedrock"] = 1
      })
    })

    use.editions = Object.keys(editionObj)
  })

  return [uses, paths]
}).then(res => {
  const uses = res[0]
  const paths = res[1]

  const pathKeys = paths.map(p => p[firestorm.ID_FIELD])
  paths.forEach(p => {
    delete p.edition
  })

  const useKeys = uses.map((u, i) => i)
  let setPaths = all.texture_path.setBulk(pathKeys, paths)
  let setUses = all.texture_use.setBulk(useKeys, uses)
  return Promise.all([setPaths, setUses])
}).then(res => {
  console.log(res)
}).catch(err => {
  console.error(err)
})