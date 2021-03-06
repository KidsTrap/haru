const { Command, FriendlyError } = require('discord.js-commando')
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
      throttling: {
        usages: 1,
        duration: 2
      },
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
    let ignoredTag = ['loli', 'shota', 'toddlercon']
    let ignoredExt = ['zip']
    let imageExt = ['png', 'jpg', 'gif']
    let videoExt = ['mp4', 'webm']
    let censored = false

    tags.toLowerCase().split(' ').some(tag => {
      if (ignoredTag.indexOf(tag) > -1) {
        censored = true
        return true
      }
      return false
    })

    if (censored) { return msg.reply('you are using a tag that is censored.') }

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

    let post = {}
    post.is_this_real_life = false
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
          if (err.error.message === 'You cannot search for more than 2 tags at a time') {
            throw new FriendlyError('You can only search for two tags at a time.')
          }
          if (err.statusCode === 421) {
            throw new FriendlyError('We\'re currently being throttled, try again later.')
          }

          let messages = []
          messages.push('there was an unhandled error while trying to fetch Danbooru,\nyou should contact the bot owner regarding this error.')

          if (err.statusCode) messages.push(`Status code: ${err.statusCode}`)
          if (err.error.message) { messages.push(err.error.message) }

          throw new FriendlyError(messages.join('\n'))
        })

      data.some(posting => {
        if (posting.is_banned || posting.is_deleted || !posting.file_url) return false
        if (ignoredExt.indexOf(posting.file_url.split('.').pop()) > -1) return false

        post = posting
        post.is_this_real_life = true
        return true
      })
    }
    while (post.is_this_real_life === false)

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
      footer: {}
    }

    embed.author.name = 'Danbooru'
    embed.author.url = 'https://danbooru.donmai.us'

    embed.title = `#${post.id}`
    embed.url = `https://danbooru.donmai.us/posts/${post.id}`

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

    let fileExt = post.file_url.split('.').pop().toLowerCase()

    embed.footer.text = `Misc (${fileExt})`
    if (imageExt.indexOf(fileExt) > -1) {
      embed.image.url = post.file_url
      embed.footer.text = 'Image'
    }
    if (videoExt.indexOf(fileExt) > -1) {
      embed.image.url = post.preview_file_url
      embed.footer.text = 'Video'
    }

    embed.timestamp = post.created_at

    msg.channel.send({ embed })
  }
}

module.exports = commandDanbooru

function truncateText (text, n) {
  return (text.length > n) ? text.substr(0, n - 1) + '\u2026' : text
}
