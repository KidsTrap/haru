require('log-timestamp')
const { CommandoClient, SQLiteProvider } = require('discord.js-commando')
const sqlite = require('sqlite')
const path = require('path')
const { promisify } = require('util')
const readdir = promisify(require('fs').readdir)

const init = async () => {
  const botconf = require('./config.json')
  const client = new CommandoClient({
    commandPrefix: botconf.botPrefix,
    owner: [ botconf.ownerID ],
    disableEveryone: true,
    unknownCommandResponse: false
  })

  client.conf = botconf

  sqlite.open(path.join(__dirname, 'data', 'settings.sqlite3'))
    .then((db) => {
      client.setProvider(new SQLiteProvider(db))
    })

  client.registry
    .registerDefaultTypes()
    .registerGroups([
      ['anime', 'Anime'],
      ['fun', 'Fun'],
      ['nsfw', 'NSFW'],
      ['util', 'Utilities']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'))

  const eventFiles = await readdir('./events/')
  eventFiles.forEach(file => {
    const eventName = file.split('.')[0]
    const event = require(`./events/${file}`)

    client.on(eventName, event.bind(null, client))
    delete require.cache[require.resolve(`./events/${file}`)]
  })

  client.login(client.conf.botToken)
}

init()
