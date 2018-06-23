const { Command, FriendlyError } = require('discord.js-commando')
const request = require('request-promise-native')

class commandYandere extends Command {
  constructor (client) {
    super(client, {
      name: 'yandere',
      group: 'nsfw',
      memberName: 'yandere',
      description: 'Search through yande.re.',
      details: 'For help on tags, refer to <https://yande.re/help/tags>',
      nsfw: true,
      throttling: {
        usages: 1,
        duration: 2
      },
      examples: [
        'yandere',
        'yandere rating:s',
        'yandere kantai_collection',
        'yandere beatless rating:q'
      ],
      args: [
        {
          key: 'tags',
          prompt: 'Type the tags it should look for',
          type: 'string'
        }
      ]
    })
  }

  async run (msg, { tags }) {
    let ignoredExt = ['zip']
    let imageExt = ['png', 'jpg', 'gif']
    let videoExt = ['mp4', 'webm']

    let requestURL = 'https://yande.re/post.json?'
    let requestParams = {
      tags: tags,
      limit: 100
    }

    let requestConstructedURL = requestURL
    Object.keys(requestParams).forEach(param => {
      requestConstructedURL += `${param}=${requestParams[param]}`

      if (!((Object.keys(requestParams).length - 1) === Object.keys(requestParams).indexOf(param))) { requestConstructedURL += '&' }
    })

    let post
    let data
    do {
      data = await request.get({
        url: requestConstructedURL,
        headers: {
          'User-Agent': 'github:intrnl/haru'
        },
        json: true
      })
        .catch(err => {
          if (err.statusCode === 421) {
            throw new FriendlyError('We\'re currently being throttled, try again later.')
          }

          let messages = []
          messages.push('there was an unhandled error while trying to fetch yande.re,\nyou should contact the bot owner regarding this error.')

          if (err.statusCode) messages.push(`Status code: ${err.statusCode}`)
          if (err.error.message) { messages.push(err.error.message) }

          throw new FriendlyError(messages.join('\n'))
        })

      do {
        var index = Math.floor(Math.random() * data.length)
        post = data[index]
      }
      while (post.is_banned || post.is_deleted || !post.file_url || ignoredExt.indexOf(post.file_url.split('.').pop().toLowerCase()) > -1)
    }
    while (!post.id)

    // Some data bodging
    switch (post.rating) {
      case 's':
        post.rating = 'Safe'
        break
      case 'q':
        post.rating = 'Questionable'
        break
      case 'e':
        post.rating = 'Explicit'
        break
      case 'u':
        post.rating = 'Unrated'
        break
    }

    // The post begins now.
    const embed = {
      author: {},
      fields: [],
      image: {},
      video: {}
    }

    embed.author.name = 'yande.re'
    embed.author.url = 'https://yande.re'

    embed.title = `#${post.id}`
    embed.url = `https://yande.re/post/show/${post.id}`

    embed.fields.push({ 'name': 'Rating', 'value': post.rating, 'inline': true })
    embed.fields.push({ 'name': 'Score', 'value': post.score, 'inline': true })
    embed.fields.push({ 'name': 'Tags', 'value': truncateText(post.tags.replace(/_/g, '\\_'), 512) })

    let fileExt = post.file_url.split('.').pop().toLowerCase()

    if (imageExt.indexOf(fileExt) > -1) { embed.image.url = post.file_url }
    if (videoExt.indexOf(fileExt) > -1) { embed.video.url = post.file_url }

    embed.image.url = post.file_url
    embed.timestamp = new Date(post.created_at * 1000).toISOString()

    msg.channel.send({ embed })
  }
}

module.exports = commandYandere

function truncateText (text, n) {
  return (text.length > n) ? text.substr(0, n - 1) + '\u2026' : text
}
