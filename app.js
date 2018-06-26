require('dotenv').config()
const { CommandoClient, SQLiteProvider } = require('discord.js-commando')
const sqlite = require('sqlite')
const path = require('path')
const { promisify } = require('util')
const readdir = promisify(require('fs').readdir)

if (!process.env.botToken || !process.env.botPrefix || !process.env.ownerID) throw new Error('no env config found.')
const init = async () => {
  const [dataCommando] = await Promise.all([
    sqlite.open(path.join(__dirname, 'data/settings.sqlite3'), { Promise })
  ])

  const client = new CommandoClient({
    commandPrefix: process.env.botPrefix,
    owner: [ process.env.ownerID ],
    disableEveryone: true,
    unknownCommandResponse: false
  })

  client.setProvider(new SQLiteProvider(dataCommando))

  client.registry
    .registerDefaultTypes()
    .registerGroups([
      ['fun', 'Fun'],
      ['anime', 'Anime'],
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

  client.login(process.env.botToken)
}

init()
