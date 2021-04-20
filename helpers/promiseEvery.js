/**
 * @typedef {Object} PromiseEveryResult
 * @property {Array<>} results Successful results
 * @property {Array<>} errors Failed errors
 * @returns 
 */

/**
 * 
 * @param {Promise<any>[]} promises Incoming promises
 * @return {Promise<PromiseEveryResult>} result array
 */
module.exports = function(promises) {
  return new Promise((resolve, reject) => {
    /** @type {PromiseEveryResult} */
    const result = {
      results: [],
      errors: []
    }

    let sum = 0
    let fails = 0
    promises.forEach((promise, index) => {
      result.results.push(undefined)
      result.errors.push(undefined)

      promise.then(res => {
        result.results[index] = res

        if(++sum === promises.length) {
          resolve(result)
        }
      })
      .catch(err => {
        ++fails

        result.errors[index] = err

        if(++sum === promises.length) {
          if(fails === promises.length) {
            reject(result)
          } else {
            resolve(result)
          }
        }
      })
    })
  })
}