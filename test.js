const {spawn} = require('child_process')

const run = () => {
  const prism = spawn('./prism/bin/prism')

  prism.on('error', err => {
    console.log(`child  ${err}`)
  })
  
  prism.on('exit', code => {
    console.log(`child process exited with code ${code}`)
  })
}

run()