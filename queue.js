const kue = require('kue')
let queue

module.exports = {
  get: () => {
    if (!queue) {
      console.log('creating a queue')
      queue = kue.createQueue()
    }
    return queue
  }
}