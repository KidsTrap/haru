const { CommandoClient, SQLiteProvider } = require('discord.js-commando')
const sqlite = require('sqlite')
const path = require('path')
const { promisify } = require('util')
const readdir = promisify(require('fs').readdir)

const init = async () => {
  const botconf = require('./config.json')
  const [dataCommando, dataScores] = await Promise.all([
    sqlite.open(path.join(__dirname, 'data/settings.sqlite3'), { Promise }),
    sqlite.open(path.join(__dirname, 'data/scores.sqlite3'), { Promise })
  ])

  await dataScores.run('CREATE TABLE IF NOT EXISTS scores (userID TEXT, points INTEGER, level INTEGER, lastGain TEXT)')

  const client = new CommandoClient({
    commandPrefix: botconf.botPrefix,
    owner: [ botconf.ownerID ],
    disableEveryone: true,
    unknownCommandResponse: false
  })

  client.setProvider(new SQLiteProvider(dataCommando))

  client.registry
    .registerDefaultTypes()
    .registerGroups([
      ['anime', 'Anime'],
      ['fun', 'Fun'],
      ['nsfw', 'NSFW'],
      ['util', 'Utilities'],
      ['mod', 'Moderation'],
      ['admin', 'Administration'],
      ['owner', 'Bot Owner']
    ])
    .registerCommandsIn(path.join(__dirname, 'commands'))

  const eventFiles = await readdir('./events/')
  eventFiles.forEach(file => {
    const eventName = file.split('.')[0]
    const event = require(`./events/${file}`)

    client.on(eventName, event.bind(null, client))
    delete require.cache[require.resolve(`./events/${file}`)]
  })

  client.login(botconf.botToken)
}

init()
