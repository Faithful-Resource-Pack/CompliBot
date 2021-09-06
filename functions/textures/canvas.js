const Canvas = require('canvas')
const PromiseEvery = require('../../helpers/promiseEvery')

class CanvasDrawer {
  /**
   * @param {canvasOptions} canvasOptions Drawing canvas options
   */
  constructor () {
    this.urls   = new Array()
    this.scale  = 1
    this.images = undefined
    this.order  = undefined
  }

  loadImages () {
    return new Promise((resolve, reject) => {
      // load all urls
      PromiseEvery(this.urls.map(url => Canvas.loadImage(url)))
        .then(pe => {
          this.images = pe.results.filter(res => res !== undefined)
          resolve(this.images)
        })
        .catch(pe => {
          reject(new Error('No image loaded from urls :' + JSON.stringify(this.urls) + ' : ' + JSON.stringify(pe.errors.map(e => e.message)) + ''))
        })
    })
  }

  draw () {
    return new Promise((resolve, reject) => {
      const dataProm = this.images === undefined ? this.loadImages() : Promise.resolve(this.images)

      // Biggest image preferences
      let biggestImage

      // Biggest image scaled properties
      let referenceWidth
      let referenceHeight

      // final canvas properties
      let canvasWidth
      let canvasHeight

      dataProm
        .then(canvasImages => {
          if (canvasImages.length === 0) resolve(Canvas.createCanvas(0, 0).toBuffer())

          // determine final canvas properties
          biggestImage = canvasImages.map(can => { return { w: can.naturalWidth, h: can.naturalHeight } }).sort((a, b) => b.h * b.w - a.h * a.w)[0]
          referenceWidth = biggestImage.w * this.scale
          referenceHeight = biggestImage.h * this.scale

          canvasWidth = referenceWidth * canvasImages.length
          canvasHeight = referenceHeight

          // get image and data
          return canvasImages.map(image => {
            const ctx = Canvas.createCanvas(image.naturalWidth, image.naturalHeight).getContext('2d')
            ctx.drawImage(image, 0, 0)

            // keep image and data for size things
            return {
              image: image,
              data: ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data
            }
          })
        })
        .then(imageAndDatas => {
          // return default order if no or incorrect parameters
          if (this.order === undefined || !Array.isArray(this.order) || this.order.length !== imageAndDatas.length) {
            return imageAndDatas
          }

          // sort images and datas by order
          this.images = imageAndDatas.map((el, index) => {
            return {
              el: el,
              index: index
            }
          }).sort((a, b) => this.order.indexOf(a.index) - this.order.indexOf(b.index)).map(obj => obj.el)
          return this.images
        })
        .then(imageAndDatas => {
          const canvasResult = Canvas.createCanvas(canvasWidth, canvasHeight)
          const ctx = canvasResult.getContext('2d')

          // draaaaw
          let textureImage, textureImageData, scale, xOffset, pixelIndex, r, g, b, a
          for (let texIndex = 0; texIndex < imageAndDatas.length; ++texIndex) {
            // get image
            textureImage = imageAndDatas[texIndex].image
            textureImageData = imageAndDatas[texIndex].data

            scale = Math.floor(referenceWidth / textureImage.naturalWidth)
            xOffset = referenceWidth * texIndex
            for (let x = 0; x < textureImage.naturalWidth; ++x) {
              for (let y = 0; y < textureImage.naturalHeight; ++y) {
                pixelIndex = (y * textureImage.naturalWidth + x) * 4
                r = textureImageData[pixelIndex]
                g = textureImageData[pixelIndex + 1]
                b = textureImageData[pixelIndex + 2]
                a = textureImageData[pixelIndex + 3] / 255

                ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
                ctx.fillRect(xOffset + x * scale, y * scale, scale, scale)
              }
            }
          }

          // give results
          resolve(canvasResult.toBuffer())
        })
        .catch(reject)
    })
  }
}

module.exports = CanvasDrawer
