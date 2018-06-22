const { Command } = require('discord.js-commando')
const anifetch = require('anifetch')

class commandManga extends Command {
  constructor (client) {
    super(client, {
      name: 'manga',
      group: 'anime',
      memberName: 'manga',
      description: 'Search for a manga series.',
      details: 'Supported provider: `Kitsu`, `AniList`.\nType the name of the provider (insensitive) before your search term to use that provider.',
      examples: [
        'manga Darling in the FranXX',
        'manga kitsu Natsume Yuujinchou',
        'manga anilist Tokyo Ghoul'
      ],
      args: [
        {
          key: 'provider',
          prompt: 'Type the name of the provider it should search with',
          type: 'string',
          default: 'kitsu'
        },
        {
          key: 'searchterm',
          prompt: 'Type the search term it should look for',
          type: 'string',
          default: ''
        }
      ]
    })
  }

  async run (msg, { provider, searchterm }) {
    let postMsg
    let data
    let supportedProvider = ['anilist', 'kitsu']
    provider = provider.toLowerCase()

    if (supportedProvider.indexOf(provider) > -1) {
      if (!searchterm) return msg.channel.send('You didn\'t specify a search term.')

      postMsg = await msg.channel.send(`Searching for '${searchterm}', please wait.`)
      data = await anifetch.search(provider, 'manga', searchterm)
        .catch(err => { throw new Error(err) })
    } else {
      searchterm = `${provider}${searchterm !== '' ? ` ${searchterm}` : ''}`

      postMsg = await msg.channel.send(`Searching for '${searchterm}', please wait.`)
      data = await anifetch.search('kitsu', 'manga', searchterm)
        .catch(err => { throw new Error(err) })
    }

    data = await anifetch.commonfy(data)
      .then(anifetch.DiscordEmbed)
      .catch(err => { throw new Error(err) })

    postMsg.edit({ embed: data })
  }
}

module.exports = commandManga
