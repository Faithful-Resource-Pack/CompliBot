const { isObject } = require('./isObject.js')

/**
 * Merge two JS object into the targeted object/array
 * @author Juknum
 * @param {Object|Array} target object/array
 * @param {Object|Array} source object/array
 */
const mergeVal = (target, source) => {
  if (isObject(target) && isObject(source))
    return mergeObj(target, source)

  if (Array.isArray(target) && Array.isArray(source))
    return mergeArr(target, source)

  if (!source) return target

  return source
}

const mergeObj = (target, source) => {
  Object.keys(source).forEach(key => {
    const sourceValue = source[key]
    const targetValue = target[key]
    target[key] = mergeVal(targetValue, sourceValue)
  })

  return target
}

const mergeArr = (target, source) => {
  source.forEach((value, index) => {
    target[index] = mergeVal(target[index], value)
  })

  return target
}

/**
 * Merge objects without overwritting data (nested objects are merged and not overwritten)
 * @author Juknum
 * @param {Object} target 
 * @param {Object[]} sources 
 */
const merge = (target, sources) => {
  sources.forEach(source => {
    return mergeVal(target, source)
  })

  return target
}

exports.merge = merge