module.exports = async client => {
  console.log(`[${new Date().toISOString()}] Serving ${client.users.size} users in ${client.channels.size} channels across ${client.guilds.size} guilds.`)
  console.log(`[${new Date().toISOString()}] Ready.`)

  client.user.setPresence({
    status: 'online',
    game: {
      name: `${client.commandPrefix}`
    }
  })
}
