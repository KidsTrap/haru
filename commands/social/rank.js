const { Command } = require('discord.js-commando')
const path = require('path')

const sql = require('sqlite')
sql.open(path.resolve(__dirname, '../../data/scores.sqlite3'))

class commandRank extends Command {
  constructor (client) {
    super(client, {
      name: 'rank',
      group: 'social',
      memberName: 'rank',
      description: 'View your rank card',
      guildOnly: true,
      examples: [
        'rank',
        'rank .intrnl#6380',
        'rank 443765978132643850'
      ],
      args: [
        {
          key: 'user',
          prompt: 'Type the name (full or partial) of a user',
          type: 'user',
          default: ''
        }
      ]
    })
  }

  async run (msg, { user }) {
    if (!user || user === '') user = msg.author
    let member = msg.guild.members.get(user.id)
    
    const embed = {
      author: {},
      thumbnail: {},
      fields: []
    }
    
    if (member.displayColor !== 0) embed.color = member.displayColor

    embed.author.name = `${user.username}#${user.discriminator}`
    embed.author.icon_url = user.displayAvatarURL
    embed.thumbnail.url = user.displayAvatarURL

    let data = await sql.get(`SELECT * FROM scores WHERE userID = "${user.id}"`)
      .catch(err => {
        console.error(`[${new Date().toISOString()}] Failed to get user "${user.id}": ${err}`)
        console.error(err)
        return msg.channel.send('Whoops, something spectacular happened. This is not meant to be seen, you should contact the bot author.')
      })
    if (!data) {
      embed.description = 'No data yet, try again later.'

      return msg.channel.send({ embed })
    }

    let description = []
    description.push(`Level: ${data.level}`)
    description.push(`EXP: ${data.points}`)
    embed.description = description.join('\n')

    msg.channel.send({ embed })
  }
}

module.exports = commandRank
