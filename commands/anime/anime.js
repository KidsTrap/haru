const { Command } = require('discord.js-commando')
const anifetch = require('anifetch')

class commandAnime extends Command {
  constructor (client) {
    super(client, {
      name: 'anime',
      group: 'anime',
      memberName: 'anime',
      description: 'Search for an anime series.',
      details: 'Supported provider: `Kitsu`, `AniList`.\nType the name of the provider (insensitive) before your search term to use that provider.',
      examples: [
        'anime Darling in the FranXX',
        'anime kitsu Natsume Yuujinchou',
        'anime anilist Tokyo Ghoul'
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
    let supportedProvider = ['anilist', 'kitsu']
    provider = provider.toLowerCase()

    if (supportedProvider.indexOf(provider) > -1) {
      if (!searchterm) return msg.channel.send('You didn\'t specify a search term.')

      data = await anifetch.search(provider, 'anime', searchterm)
        .catch(err => { throw new Error(err) })
    } else {
      searchterm = `${provider}${searchterm !== '' ? ` ${searchterm}` : ''}`

      data = await anifetch.search('kitsu', 'anime', searchterm)
        .catch(err => { throw new Error(err) })
    }

    data = await anifetch.commonfy(data)
      .then(anifetch.DiscordEmbed)
      .catch(err => { throw new Error(err) })

    msg.channel.send({ embed: data })
  }
}

module.exports = commandAnime
