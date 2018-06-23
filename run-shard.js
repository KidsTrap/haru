const botconf = require('./config.json')
const { ShardingManager } = require('discord.js')
const manager = new ShardingManager('./index.js', {
  token: botconf.botToken
})

manager.spawn()

manager.on('launch', shard => {
  console.log(`[${new Date().toISOString()}] Launched shard #${shard.id}`)
})

manager.on('message', (shard, message) => {
  console.log(`[${new Date().toISOString()}] #${shard.id} | ${message._eval} | ${message._result}`)
})