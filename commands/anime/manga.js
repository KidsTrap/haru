const { Command } = require('discord.js-commando')
const anifetch = require('anifetch')
const request = require('request-promise-native')

let supportedProvider = ['anilist', 'kitsu', 'myanimelist']

class commandAnime extends Command {
  constructor (client) {
    super(client, {
      name: 'manga',
      group: 'anime',
      memberName: 'manga',
      description: 'Search for a manga series.',
      details: [
        `Supported provider: ${supportedProvider.map(provider => `\`${provider}\``).join(' ')}`,
        'Type the name of the provider (insensitive) before your search term to use that provider.'
      ].join('\n'),
      examples: [
        'manga Darling in the FranXX',
        'manga kitsu Natsume Yuujinchou',
        'manga anilist Tokyo Ghoul',
        'manga myanimeist One Piece'
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
    let data
    provider = provider.toLowerCase()

    if (supportedProvider.indexOf(provider) > -1) {
      if (!searchterm) return msg.channel.send('You didn\'t specify a search term.')
    } else {
      searchterm = `${provider}${searchterm !== '' ? ` ${searchterm}` : ''}`
      provider = 'kitsu'
    }

    data = await anifetch(provider, 'manga', searchterm)
      .catch(err => { throw new Error(err) })

    if (provider === 'myanimelist') {
      let lookupData = data[0]
      if (!lookupData) return msg.channel.send('Search term seems to return nothing.')

      let requestData = await request.get({
        url: `https://api.jikan.moe/manga/${lookupData.id}`,
        headers: { 'User-Agent': 'Haru, a simple Discord bot.' },
        json: true
      })
        .catch(err => { throw new Error(err) })

      data = [requestData].map(anifetch.MALFull)
    }

    data =
      Array.isArray(data) ? data.map(anifetch.DiscordEmbed)[0]
        : typeof data === 'object' ? [data].map(anifetch.DiscordEmbed)[0] : null

    if (!data) return msg.channel.send('Search term seems to return nothing.')

    msg.channel.send({ embed: data })
  }
}

module.exports = commandAnime
