const { Command } = require('discord.js-commando')
const request = require('request-promise-native')

class commandDanbooru extends Command {
  constructor (client) {
    super(client, {
      name: 'danbooru',
      group: 'nsfw',
      memberName: 'danbooru',
      description: 'Search through Danbooru.',
      details: 'You can only search for two tags at a time\nSearching with the tags below however, doesn\'t count against the limit.\n`rating:safe` `status:deleted` `-status:deleted` `limit:200`\nFor help on tags, refer to <https://danbooru.donmai.us/wiki_pages/43043>',
      nsfw: true,
      examples: [
        'danbooru',
        'danbooru rating:s',
        'danbooru kantai_collection',
        'danbooru beatless rating:q'
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
    let requestURL = 'https://danbooru.donmai.us/posts.json?'
    let requestParams = {
      tags: tags,
      random: true,
      limit: 100
    }

    let requestConstructedURL = requestURL
    Object.keys(requestParams).forEach(param => {
      requestConstructedURL += `${param}=${requestParams[param]}`

      if (!((Object.keys(requestParams).length - 1) === Object.keys(requestParams).indexOf(param))) { requestConstructedURL += '&' }
    })

    let data = await request.get({
      url: requestConstructedURL,
      headers: {
        'User-Agent': 'Haru, a general purpose Discord bot.'
      },
      json: true
    })
      .catch(err => {
        if (err.error.message === 'You cannot search for more than 2 tags at a time') {
          return msg.channel.send('You can only search for two tags at a time.')
        }

        let messages = []
        messages.push('There was an unhandled error while trying to fetch Danbooru, you should contact the bot owner regarding this error.')

        if (err.statusCode) messages.push(`Status code: ${err.statusCode}`)
        if (err.error.message) { messages.push(err.error.message) }

        msg.channel.send(messages.join('\n'))
      })

    let post
    data.forEach(dataPost => {
      if (dataPost.is_banned || dataPost.is_deleted || dataPost.file_url) return
      post = dataPost
    })

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
      image: {}
    }

    embed.author.name = 'Danbooru'
    embed.author.url = 'https://danbooru.donmai.us'

    embed.title = `#${post.id}`
    embed.url = `https://danbooru.donmai.us`

    let tagsData = []
    if (post.tag_string_general) tagsData.push(`**general**: ${truncateText(post.tag_string_general, 200)}`)
    if (post.tag_string_character) tagsData.push(`**character**: ${truncateText(post.tag_string_character, 200)}`)
    if (post.tag_string_copyright) tagsData.push(`**copyright**: ${truncateText(post.tag_string_copyright, 200)}`)
    if (post.tag_string_artist) tagsData.push(`**artist**: ${truncateText(post.tag_string_artist, 200)}`)
    if (post.tag_string_meta) tagsData.push(`**meta**: ${truncateText(post.tag_string_meta, 200)}`)
    tagsData = tagsData.join('\n').replace(/_/g, '\\_')

    embed.fields.push({ 'name': 'Rating', 'value': post.rating, 'inline': true })
    embed.fields.push({ 'name': 'Score', 'value': post.score, 'inline': true })
    embed.fields.push({ 'name': 'Tags', 'value': tagsData })

    embed.image.url = post.file_url
    embed.timestamp = post.created_at

    msg.channel.send({ embed })
  }
}

module.exports = commandDanbooru

function truncateText (text, n) {
  return (text.length > n) ? text.substr(0, n - 1) + '\u2026' : text
}
