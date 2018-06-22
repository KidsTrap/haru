const { Command } = require('discord.js-commando')
const Fuse = require('fuse.js')

class commandFindUser extends Command {
  constructor(client) {
    super(client, {
      name: 'finduser',
      group: 'util',
      memberName: 'finduser',
      description: 'Shows a list of user(s) that the bot knows.',
      examples: [
        'finduser',
        'finduser .intrnl#6380',
        'finduser 443765978132643850'
      ],
      args: [
        {
          key: 'user',
          prompt: 'Type the name (full or partial) of a user you\'d like to search',
          type: 'string'
        }
      ]
    })
  }

  async run (msg, { user }) {
    // Options for fuse.js
    let fuseOptions = {
      shouldSort: true,
      threshold: 0.5,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'user',
        'id'
      ]
    }

    // Build an array of users
    let haystack = []
    this.client.users.forEach(user => {
      haystack.push({
        user: `${user.username}#${user.discriminator}`,
        id: user.id,
        bot: user.bot
      })
    })

    let fuseSearch = new Fuse(haystack, fuseOptions)
    let result = fuseSearch.search(user)
    let resultSpliced = result.splice(0, 10)

    let messageData = []
    messageData.push(`Returned ${resultSpliced.length} known user(s) from a total of ${this.client.users.size} users.`)
    messageData.push('Showing only 10 users max.')
    messageData.push('```')

    resultSpliced.forEach(user => {
      messageData.push(`${user.user} (${user.id})${user.bot ? ' (BOT)' : ''}`)
    })

    messageData.push('```')

    msg.channel.send(messageData)
  }
}

module.exports = commandFindUser
