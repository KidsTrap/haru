module.exports = async error => {
  console.error(`[${new Date().toISOString()}] ERROR | ${error}`)
  console.error(error)
}
