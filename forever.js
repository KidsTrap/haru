const forever = require('forever-monitor')

var child = new (forever.Monitor)('./index.js', {
  silent: false
})

child.on('restart', function () {
  console.log(`Restarting bot for the ${child.times} time`)
})

console.log('Starting the bot')
child.start()
