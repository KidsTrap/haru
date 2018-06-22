module.exports = async info => {
  console.warn(`[${new Date().toISOString()}] WARN: ${info}`)
  console.warn(info)
}
