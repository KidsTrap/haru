const { Command } = require('discord.js-commando')

class commandPing extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      group: 'util',
      memberName: 'ping',
      description: 'Checks the bot\'s connection to Discord servers.',
      throttling: {
        usages: 3,
        duration: 5
      }
    })
  }

  async run (msg) {
    const startTime = Date.now()
    const pingMsg = await msg.channel.send('Trying to ping, please wait.')

    pingMsg.edit(`Pong! Round-trip took ${Date.now() - startTime}ms. Heartbeat ping is ${Math.round(this.client.ping)}ms.`)
  }
}

module.exports = commandPing
