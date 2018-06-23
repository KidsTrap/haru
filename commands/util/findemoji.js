const { Command } = require('discord.js-commando')
const Fuse = require('fuse.js')

class commandFindEmoji extends Command {
  constructor (client) {
    super(client, {
      name: 'findemoji',
      group: 'util',
      memberName: 'findemoji',
      description: 'Shows a list of custom emoji(s) that the bot knows.',
      examples: [
        'findemoji',
        'findemoji .intrnl#6380',
        'findemoji 443765978132643850'
      ],
      args: [
        {
          key: 'emoji',
          prompt: 'Type the name (full or partial) of a custom emoji you\'d like to search',
          type: 'string'
        }
      ]
    })
  }

  async run (msg, { emoji }) {
    // Options for fuse.js
    let fuseOptions = {
      shouldSort: true,
      threshold: 0.5,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'name',
        'id'
      ]
    }

    // Build an array of custom emojis
    let haystack = []
    this.client.emojis.forEach(emoji => {
      haystack.push({
        name: emoji.name,
        id: emoji.id,
        animated: emoji.animated
      })
    })

    let fuseSearch = new Fuse(haystack, fuseOptions)
    let result = fuseSearch.search(emoji)
    let resultSpliced = result.splice(0, 10)

    let messageData = []
    messageData.push(`Returned ${resultSpliced.length} known custom emoji(s) from a total of ${this.client.emojis.size} custom emojis.`)
    messageData.push('Showing only 10 custom emojis max.')
    messageData.push('')

    resultSpliced.forEach(emoji => {
      var construct = `<:${emoji.name}:${emoji.id}>`
      if (emoji.animated) construct = `<a:${emoji.name}:${emoji.id}>`

      messageData.push(`${construct} - ${emoji.name}`)
    })

    msg.channel.send(messageData)
  }
}

module.exports = commandFindEmoji
