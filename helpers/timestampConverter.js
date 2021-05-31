function timestampConverter(timestamp) {
  const a = new Date(parseInt(timestamp))
  const year = a.getFullYear()
  const month = a.getMonth() + 1
  const date = a.getDate()
  return `${date < 10 ? '0' + date : date}/${month < 10 ? '0' + month : month}/${year}`
}

exports.timestampConverter = timestampConverter