const express = require('express')
const router = express.Router()
const { promisify } = require('util')
const path = require('path')
const fs = require('fs')

const readFile = promisify(fs.readFile)

const ROOT_FOLDER = './tmp/'
router.post('/experiments/:id/executions', async (req, res) => {
  const id = req.params.id
  const file = path.join(ROOT_FOLDER, id, `descriptor.json`)

  try {
    const descriptor = await readFile(file)
    
    return res.status(200).json(JSON.parse(descriptor))
  } catch (err) {
    return res.status(500).json(err)
  }
})

module.exports = router