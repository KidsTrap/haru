const request = require('request-promise-native')
const regexWebURL = require('../modules/re_weburl')
const sql = require('sqlite')
const path = require('path')

module.exports = async (client, message) => {
  if (message.author.bot) return

  // URL link
  let urlCheck = await checkWebURL(message.content)
  if (message.guild && urlCheck[0]) {
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

    embed.fields.push({ 'name': 'Message content', 'value': truncateText(message.content, 1024) })
    embed.fields.push({ 'name': 'Jump link', 'value': `https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id}` })

    // Google Safe Browsing API check
    let safebrowsingToken = process.env.safebrowsingAPI
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

        let stringBuild = ''
        if (data.matches) {
          stringBuild += `Unsafe (${data.matches.length}/${slicedArray.length})`
        } else {
          stringBuild += `Safe (${slicedArray.length}/${slicedArray.length})`
        }

        stringBuild += '\nSafe Browsing API only allows 3 links at a time.'
        embed.fields.push({ 'name': 'Google Safe Browsing', 'value': stringBuild })
      } catch (e) {
        throw new Error(e)
      }
    }

    message.guild.channels.forEach(function (guildChannel) {
      if (guildChannel.type !== 'text') return
      if (guildChannel.id === message.channel.id) return
      if (typeof guildChannel.topic !== 'string') return
      if (!guildChannel.permissionsFor(client.user.id).has(['VIEW_CHANNEL', 'SEND_MESSAGES'])) return

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

        if (message.content) embed.fields.push({ 'name': 'Comment', 'value': truncateText(message.content, 1024) })
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
          if (guildChannel.type !== 'text') return
          if (guildChannel.id === message.channel.id) return
          if (typeof guildChannel.topic !== 'string') return
          if (!guildChannel.permissionsFor(client.user.id).has(['VIEW_CHANNEL', 'SEND_MESSAGES'])) return

          if (guildChannel.topic.includes(logText)) guildChannel.send({ embed })
        })
      })
    } catch (e) {
      throw new Error(e)
    }
  }

  // Zalgo text detection
  let optionCheckZalgo = message.guild.settings.get('checkZalgo', false)
  let optionAbuseZalgo = message.guild.settings.get('abuseZalgo', false)

  if (message.guild && (optionCheckZalgo || optionAbuseZalgo)) {
    let logText = `@${client.user.username.toLowerCase()}-message-abuse;`
    let zalgoCharacters = [
      // Upper
      '̍', '̎', '̄', '̅', '̿', '̑', '̆', '̐', '͒', '͗', '͑', '̇', '̈', '̊',
      '͂', '̓', '̈́', '͊', '͋', '͌', '̃', '̂', '̌', '͐', '̀', '́', '̋', '̏',
      '̒', '̓', '̔', '̽', '̉', 'ͣ', 'ͤ', 'ͥ', 'ͦ', 'ͧ', 'ͨ', 'ͩ', 'ͪ', 'ͫ',
      'ͬ', 'ͭ', 'ͮ', 'ͯ', '̾', '͛', '͆', '̚',

      // Middle
      '̕', '̛', '̀', '́', '͘', '̡', '̢', '̧', '̨', '̴', '̵', '̶', '͏', '͜',
      '͝', '͞', '͟', '͠', '͢', '̸', '̷', '͡', '҉',

      // Lower
      '̖', '̗', '̘', '̙', '̜', '̝', '̞', '̟', '̠', '̤', '̥', '̦', '̩', '̪',
      '̫', '̬', '̭', '̮', '̯', '̰', '̱', '̲', '̳', '̹', '̺', '̻', '̼', 'ͅ',
      '͇', '͈', '͉', '͍', '͎', '͓', '͔', '͕', '͖', '͙', '͚', '̣'
    ]

    let splitMessage = message.content.split('')
    let totalCharSize = splitMessage.length
    let totalZalgoSize = 0
    let totalNonZalgoSize = 0

    splitMessage.forEach(character => {
      if (zalgoCharacters.indexOf(character) > -1) return totalZalgoSize++
      return totalNonZalgoSize++
    })

    /* Zalgo text threshold
     * Currently it only checks if the threshold is over 0.65,
     * which covers most zalgo text except those that only use the middle character.
     *
     * Only upper character: ~0.68
     * Only lower character: ~0.69
     * Only middle character: ~0.36
     *
     * Lower and middle charcater: ~0.71
     * Upper and middle character: ~0.72
     * Upper and lower character: ~0.74
     * Upper, lower and middle character: ~0.75
     */

    let zalgoThreshold = totalZalgoSize / totalCharSize
    let zalgoOver = zalgoThreshold > 0.65

    // Send a log if the `checkZalgo` is enabled
    if (zalgoOver && optionCheckZalgo) {
      const embed = {
        author: {},
        thumbnail: {},
        fields: [],
        footer: {}
      }

      embed.author.name = `${message.author.username}#${message.author.discriminator}`
      embed.author.icon_url = message.author.avatarURL
      embed.description = `<@!${message.author.id}> sent a zalgo text in <#${message.channel.id}>\n`
      embed.footer.text = `${message.id}`
      embed.timestamp = new Date(message.createdAt).toISOString()

      embed.fields.push({ 'name': 'Message content', 'value': truncateText(message.content, 1024) })
      embed.fields.push({ 'name': 'Jump link', 'value': `https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id}` })

      message.guild.channels.forEach(function (guildChannel) {
        if (guildChannel.type !== 'text') return
        if (guildChannel.id === message.channel.id) return
        if (typeof guildChannel.topic !== 'string') return
        if (!guildChannel.permissionsFor(client.user.id).has(['VIEW_CHANNEL', 'SEND_MESSAGES'])) return

        if (guildChannel.topic.includes(logText)) guildChannel.send({ embed })
      })
    }

    // Delete the message if `abuseZalgo` is enabled
    if (zalgoOver && optionAbuseZalgo) {
      if (message.guild.me.hasPermission('MANAGE_MESSAGES')) {
        message.reply('you\'re not allowed to post zalgo text!')
        message.delete()
      }
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

function truncateText (text, n) {
  return (text.length > n) ? text.substr(0, n - 1) + '\u2026' : text
}
