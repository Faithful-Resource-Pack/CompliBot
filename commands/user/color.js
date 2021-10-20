const Discord = require('discord.js')
const prefix = process.env.PREFIX;
const strings = require('../../resources/strings');
const Canvas = require('canvas')

const { warnUser } = require('../../helpers/warnUser');
const { addDeleteReact } = require('../../helpers/addDeleteReact')

module.exports = {
  name: 'color',
  aliases: ['color', 'colour', 'c'],
  description: strings.HELP_DESC_COLOR,
  guildOnly: false,
  uses: strings.COMMAND_USES_ANYONE,
  syntax: `
${prefix}color #123456
${prefix}color rgb([0-255],[0-255],[0-255])
${prefix}color rgba([0-255],[0-255],[0-255],[0-1])
${prefix}color hsl([0-360],[0-100],[0-100])
${prefix}color hsv([0-360],[0-100],[0-100])
${prefix}color cmyk([0-100],[0-100],[0-100],[0-100])`,
  example: `
${prefix}color #fff
${prefix}color #ff8025
${prefix}color rgb(255,128,37)
${prefix}color rgba(255,128,37,1)
${prefix}color hsl(25,100,57)
${prefix}color hsv(25,85,100)
${prefix}color cmyk(0,50,85,0)`,
  async execute(client, message, args) {
    if (args.length < 1) return warnUser(message, strings.COMMAND_NOT_ENOUGH_ARGUMENTS_GIVEN)

    args = args[0]

    let rgb = new Array()
    let cmyk = new Array()
    let hsl = new Array()
    let hsv = new Array()
    let hex = null
    let alpha = null

    if (args.startsWith('rgb(')) {
      rgb = args.slice(4).slice(0, -1).split(',').map(c => c | 0) // remove formating, remove ), split & convert to int

      if (rgb.length < 3 || rgb.length > 3) return warnUser(message, strings.COLOR_RGB_NO_VALUES)
      for (let i = 0; i < 3; i++) if (rgb[i] > 255 || rgb[i] < 0) return warnUser(message, strings.COLOR_RGB_WRONG_VALUES)

      hex = RGBtoHEX(rgb[0], rgb[1], rgb[2])
      hsl = RGBtoHSL(rgb[0], rgb[1], rgb[2])
      hsv = RGBtoHSV(rgb[0], rgb[1], rgb[2])
      cmyk = RGBtoCMYK(rgb[0], rgb[1], rgb[2])
    }
    else if (args.startsWith('rgba(')) {
      rgb = args.slice(5).slice(0, -1).split(',')

      if (rgb.length < 4 || rgb.length > 4) return warnUser(message, strings.COLOR_RGBA_NO_VALUES)

      for (let i = 0; i < 3; i++) {
        if (rgb[i] > 255 || rgb[i] < 0) return warnUser(message, strings.COLOR_RGBA_WRONG_VALUES)
        else rgb[i] = rgb[i] | 0
      }
      if (rgb[3] && (rgb[3] > 1 || rgb[3] < 0)) return warnUser(message, strings.COLOR_RGBA_ALPHA_VALUE)
      else rgb[3] = parseFloat(rgb[3]).toFixed(2)

      hex = RGBAtoHEXA(rgb[0], rgb[1], rgb[2], rgb[3])

      if (hex.length > 7) {
        alpha = hex.slice(7)
        hex = hex.slice(0, 7)
      }

      hsl = RGBtoHSL(rgb[0], rgb[1], rgb[2])
      hsv = RGBtoHSV(rgb[0], rgb[1], rgb[2])
      cmyk = RGBtoCMYK(rgb[0], rgb[1], rgb[2])
    }
    else if (args.startsWith('hsl(')) {
      hsl = args.slice(4).slice(0, -1).split(',').map(c => c | 0)

      if (hsl.length < 3 || hsl.length > 3) return warnUser(message, strings.COLOR_HSL_NO_VALUES)
      if (hsl[0] > 360 || hsl[0] < 0) return warnUser(message, strings.COLOR_HSL_DEGREE_VALUE)
      if (hsl[1] > 100 || hsl[1] < 0 || hsl[2] > 100 || hsl[2] < 0) return warnUser(message, strings.COLOR_HSL_SL_VALUES)

      rgb = HSLtoRGB(hsl[0], hsl[1], hsl[2])
      hex = RGBtoHEX(rgb[0], rgb[1], rgb[2])
      hsv = RGBtoHSV(rgb[0], rgb[1], rgb[2])
      cmyk = RGBtoCMYK(rgb[0], rgb[1], rgb[2])
    }
    else if (args.startsWith('hsv(')) {
      hsv = args.slice(4).slice(0, -1).split(',').map(c => c | 0)

      if (hsv.length < 3 || hsv.length > 3) return warnUser(message, strings.COLOR_HSV_NO_VALUES)
      if (hsv[0] > 360 || hsv[0] < 0) return warnUser(message, strings.COLOR_HSV_DEGREE_VALUE)
      if (hsv[1] > 100 || hsv[1] < 0 || hsv[2] > 100 || hsv[2] < 0) return warnUser(message, strings.COLOR_HSV_SV_VALUES)

      rgb = HSVtoRGB(hsv[0], hsv[1], hsv[2])
      hex = RGBtoHEX(rgb[0], rgb[1], rgb[2])
      hsl = RGBtoHSL(rgb[0], rgb[1], rgb[2])
      cmyk = RGBtoCMYK(rgb[0], rgb[1], rgb[2])
    }
    else if (args.startsWith('cmyk(')) {
      cmyk = args.slice(5).slice(0, -1).split(',').map(c => c | 0)

      if (cmyk.length < 4 || hsl.length > 4) return warnUser(message, strings.COLOR_CMYK_NO_VALUES)
      for (let i = 0; i < 3; i++) if (rgb[i] > 100 || rgb[i] < 0) return warnUser(message, strings.COLOR_CMYK_WRONG_VALUES)
      rgb = CMYKtoRGB(cmyk[0], cmyk[1], cmyk[2], cmyk[3])
      hex = RGBtoHEX(rgb[0], rgb[1], rgb[2])
      hsl = RGBtoHSL(rgb[0], rgb[1], rgb[2])
      hsv = RGBtoHSV(rgb[0], rgb[1], rgb[2])
    }
    else if (args.startsWith('#')) {

      hex = args
      if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)|(^#[0-9A-F]{8}$)/i.test(args) == false) return warnUser(message, strings.COLOR_HEX_WRONG_VALUE + '\n' + strings.COLOR_HEX_WRONG_DIGITS)

      switch (hex.length) {
        case 4:
          // if #f3f -> double each digit: #ff33ff
          hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
          break
        case 7:
          break
        case 9:
          alpha = hex.slice(7)
          hex = hex.slice(0, 7)
          break
        default:
          break
      }

      if (alpha) rgb = HEXAtoRGBA(`${hex}${alpha}`)
      else rgb = HEXtoRGB(hex)

      hsl = RGBtoHSL(rgb[0], rgb[1], rgb[2])
      hsv = RGBtoHSV(rgb[0], rgb[1], rgb[2])
      cmyk = RGBtoCMYK(rgb[0], rgb[1], rgb[2])
    }
    else return warnUser(message, `There is no format for this argument, type \`${prefix}help color\` to see how formating works.`)

    hsl = [
      (hsl[0] * 360).toFixed(0),
      (hsl[1] * 100).toFixed(0),
      (hsl[2] * 100).toFixed(0)
    ]

    hsv = [
      (hsv[0] * 360).toFixed(0),
      (hsv[1] * 100).toFixed(0),
      (hsv[2] * 100).toFixed(0)
    ]

    let canvas = Canvas.createCanvas(128, 128)
    let canvasCTX = canvas.getContext('2d')

    canvasCTX.fillStyle = alpha ? `${hex}${alpha}` : hex
    canvasCTX.fillRect(0, 0, 128, 128)
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'color.png')

    let embed = new Discord.MessageEmbed()
      .setTitle('Color Preview')
      .setColor(hex)
      .addFields(
        { name: `HEX${alpha ? 'a' : ''}`, value: `\`${hex}${alpha ? alpha : ''}\``, inline: true },
        { name: `RGB${alpha ? 'a' : ''}`, value: `\`${rgb.join(', ')}\``, inline: true },
        { name: 'HSL', value: `\`${hsl[0]}°, ${hsl[1]}%, ${hsl[2]}%\``, inline: true },
        { name: 'HSV', value: `\`${hsv[0]}°, ${hsv[1]}%, ${hsv[2]}%\``, inline: true },
        { name: 'CMYK', value: `\`${cmyk.join('%, ')}%\``, inline: true }
      )
      .setThumbnail('attachment://color.png')

    const embedMessage = await message.reply({ embeds: [embed], files: [attachment] })
    addDeleteReact(embedMessage, message, true)
  }
}

function CMYKtoRGB(c, m, y, k) {
  c /= 100
  m /= 100
  y /= 100
  k /= 100

  c = c * (1 - k) + k
  m = m * (1 - k) + k
  y = y * (1 - k) + k

  return [
    Math.round((1 - c) * 255),
    Math.round((1 - m) * 255),
    Math.round((1 - y) * 255)
  ]
}

function HEXAtoRGBA(hexa) {
  let res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexa)

  return res ? [
    parseInt(res[1], 16),
    parseInt(res[2], 16),
    parseInt(res[3], 16),
    (parseInt(res[4], 16) / 255).toFixed(2)
  ] : [0, 0, 0, 0]
}

function HEXtoRGB(hex) {
  let res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return res ? [
    parseInt(res[1], 16),
    parseInt(res[2], 16),
    parseInt(res[3], 16)
  ] : [0, 0, 0]
}

function HSVtoRGB(h, s, v) {
  let r, g, b

  let i = Math.floor(h * 6)
  let f = h * 6 - i
  let p = v * (1 - s)
  let q = v * (1 - f * s)
  let t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      r = v, g = t, b = p
      break
    case 1:
      r = q, g = v, b = p
      break
    case 2:
      r = p, g = v, b = t
      break
    case 3:
      r = p, g = q, b = v
      break
    case 4:
      r = t, g = p, b = v
      break
    case 5:
      r = v, g = p, b = q
      break
  }

  return [
    Math.max(0, Math.min(Math.round(r * 255), 255)),
    Math.max(0, Math.min(Math.round(g * 255), 255)),
    Math.max(0, Math.min(Math.round(b * 255), 255))
  ]
}

function HSLtoRGB(h, s, l) {
  let r, g, b

  if (s == 0) r = g = b = l // achromatic
  else {
    let q = l < .5 ? l * (1 + s) : l + s - l * s
    let p = 2 * l - q

    r = HUEtoRGB(p, q, h + 1 / 3)
    g = HUEtoRGB(p, q, h)
    b = HUEtoRGB(p, q, h - 1 / 3)
  }

  return [
    Math.max(0, Math.min(Math.round(r * 255), 255)),
    Math.max(0, Math.min(Math.round(g * 255), 255)),
    Math.max(0, Math.min(Math.round(b * 255), 255))
  ]
}

function HUEtoRGB(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6

  return q
}

function RGBtoCMYK(r, g, b) {
  let c = 1 - (r / 255)
  let m = 1 - (g / 255)
  let y = 1 - (b / 255)
  let k = Math.min(c, Math.min(m, y))

  c = Math.round(((c - k) / (1 - k)) * 10000) / 100
  m = Math.round(((m - k) / (1 - k)) * 10000) / 100
  y = Math.round(((y - k) / (1 - k)) * 10000) / 100
  k = Math.round(k * 10000) / 100

  c = isNaN(c) ? 0 : c
  m = isNaN(m) ? 0 : m
  y = isNaN(y) ? 0 : y
  k = isNaN(k) ? 0 : k

  return [c.toFixed(0), m.toFixed(0), y.toFixed(0), k.toFixed(0)]
}


function RGBtoHSV(r, g, b) {
  r /= 255, g /= 255, b /= 255

  let max = Math.max(r, g, b)
  let min = Math.min(r, g, b)
  let h, s, v = max

  let d = max - min
  s = max == 0 ? 0 : d / max

  if (max == min) h = 0 // achromatic
  else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6
  }

  return [h, s, v]
}

function RGBtoHSL(r, g, b) {
  r /= 255, g /= 255, b /= 255

  let max = Math.max(r, g, b)
  let min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max == min) h = s = 0 // achromatic
  else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

  }

  h /= 6

  return [h, s, l]
}

function RGBtoHEX(r, g, b) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}

function RGBAtoHEXA(r, g, b, a) {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}${componentToHex((a * 255).toFixed(0))}`
}

function componentToHex(c) {
  let hex
  if (typeof c === 'string') hex = parseInt(c, 10).toString(16)
  else hex = c.toString(16)
  return hex.length == 1 ? "0" + hex : hex
}