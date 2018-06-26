require('dotenv').config()
if (!process.env.botToken || !process.env.botPrefix || !process.env.ownerID) throw new Error('no env config found.')

const { ShardingManager } = require('discord.js')
const manager = new ShardingManager('./app.js', {
  token: process.env.botToken
})

manager.spawn()

manager.on('launch', shard => {
  console.log(`[${new Date().toISOString()}] Launched shard #${shard.id}`)
})

manager.on('message', (shard, message) => {
  console.log(`[${new Date().toISOString()}] #${shard.id} | ${message._eval} | ${message._result}`)
})
