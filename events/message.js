const botconf = require('../config.json')
const request = require('request-promise-native')
const regexWebURL = require('../modules/re_weburl')

module.exports = async (client, message) => {
  if (message.author.bot) return

  // URL link
  let urlCheck = await checkWebURL(message.content)
  if (urlCheck[0]) {
    let logText = `@${client.user.username.toLowerCase()}-message-link;`

    const embed = {
      author: {},
      fields: [],
      footer: {}
    }

    embed.author.name = `${message.author.username}#${message.author.discriminator}`
    embed.author.icon_url = message.author.avatarURL
    embed.description = `<@!${message.author.id}> sent ${urlCheck.length} link(s) in <#${message.channel.id}>`
    embed.footer.text = `${message.id}`
    embed.timestamp = new Date(message.createdAt).toISOString()

    embed.fields.push({ 'name': 'Message content', 'value': message.content })
    embed.fields.push({ 'name': 'Jump link', 'value': `https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id}` })

    // Google Safe Browsing API check
    let safebrowsingToken = botconf.safebrowsingAPI
    if (safebrowsingToken && safebrowsingToken !== '') {
      try {
        let slicedArray = urlCheck.slice(0, 3)
        let requestURL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${safebrowsingToken}`
        let requestBody = {
          'client': {
            'clientId': 'github:intrnl/haru',
            'clientVersion': '1.0.0'
          },
          'threatInfo': {
            'threatTypes': ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            'platformTypes': ['ALL_PLATFORMS'],
            'threatEntryTypes': ['URL', 'EXECUTABLE'],
            'threatEntries': []
          }
        }

        slicedArray.forEach(url => {
          let pushArray = requestBody.threatInfo.threatEntries

          pushArray.push({ 'url': url })
        })

        let data = await request.post({
          url: requestURL,
          headers: {
            'User-Agent': 'github:intrnl/haru',
            'Content-Type': 'application/json'
          },
          body: requestBody,
          json: true
        })

        if (data.matches) {
          embed.fields.push({ 'name': 'Google Safe Browsing', 'value': `Unsafe (${data.matches.length}/3)` })
        } else {
          embed.fields.push({ 'name': 'Google Safe Browsing', 'value': 'Safe (3/3)' })
        }
      } catch (e) {
        console.error('Error while trying to check Safe Browsing API')
        console.error(e)
      }
    }

    message.guild.channels.forEach(function (guildChannel) {
      if (guildChannel.id === message.channel.id) return
      if (typeof guildChannel.topic !== 'string') return
      if (!message.guild.me.hasPermission('SEND_MESSAGES')) return

      if (guildChannel.topic.includes(logText)) guildChannel.send({ embed })
    })
  }

  // Attachment logging
  if (message.guild && message.attachments) {
    try {
      let logText = `@${client.user.username.toLowerCase()}-message-attachment;`

      message.attachments.forEach(function (attachment) {
        const embed = {
          author: {},
          thumbnail: {},
          fields: [],
          footer: {}
        }

        embed.author.name = `${message.author.username}#${message.author.discriminator}`
        embed.author.icon_url = message.author.avatarURL
        embed.description = `<@!${message.author.id}> sent an attachment in <#${message.channel.id}>`
        embed.footer.text = `${message.id}/${attachment.id}`
        embed.timestamp = new Date(message.createdAt).toISOString()

        let fileSize

        if (attachment.filesize > 1000000) fileSize = `${(attachment.filesize / 1000000).toFixed(2)} MB`
        if (attachment.filesize < 1000000) fileSize = `${(attachment.filesize / 1000).toFixed(2)} KB`
        if (attachment.filesize < 1000) fileSize = `${attachment.filesize} bytes`

        if (message.content) embed.fields.push({ 'name': 'Comment', 'value': message.content })
        embed.fields.push({ 'name': 'File name', 'value': attachment.filename })
        if (fileSize) embed.fields.push({ 'name': 'File size', 'value': fileSize, 'inline': true })
        embed.fields.push({ 'name': 'File URL', 'value': `[Link](${attachment.url})`, 'inline': true })

        if (attachment.height && attachment.width) {
          embed.thumbnail.url = attachment.url
          embed.thumbnail.proxy_url = attachment.proxy_url

          let mediaSize = `${attachment.width.toString()}x${attachment.height.toString()}`
          embed.fields.push({ 'name': 'Resolution', 'value': mediaSize, 'inline': true })
        }

        embed.fields.push({ 'name': 'Jump link', 'value': `https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id}` })

        message.guild.channels.forEach(function (guildChannel) {
          if (guildChannel.id === message.channel.id) return
          if (typeof guildChannel.topic !== 'string') return
          if (!message.guild.me.hasPermission('SEND_MESSAGES')) return

          if (guildChannel.topic.includes(logText)) guildChannel.send({ embed })
        })
      })
    } catch (e) {
      console.error(e)
    }
  }
}

function checkWebURL (content) {
  let urlArray = []
  content = content.replace(/\n/g, ' ')
  let msgArray = content.split(' ')

  msgArray.forEach(word => {
    if (regexWebURL.gruber.test(word) || regexWebURL.dperini.test(word)) {
      urlArray.push(word)
    }
  })

  return urlArray
}
