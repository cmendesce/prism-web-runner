const queue = require('./queue')
const { exec } = require('child_process')
const fs = require('fs')

queue.get().process('prism', 1, async (job, done) => {
  await exec(job.data.command, (err, stdout) => {
    if (err) {
      done(err)
    } else {
      // fs.readFile(`/Users/carlosmendes/unifor/prism-web-runner/prism-4.4-osx64/bin/prism/${job.data.result}`, (err, data) => {
      //   if (err) {
      //     done(err)
      //   } else {
      //     job.log('result: ' + data)
      //     done()
      //   }
      // })

      job.log(stdout)
      done()
    }
  })
})