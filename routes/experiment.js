const express = require('express')
const router = express.Router()
const { promisify } = require('util')
const path = require('path')

const uuid = require('uuid').v4
const multer  = require('multer')

const fs = require('fs')
const mkdir = promisify(fs.mkdir)
const mv = promisify(fs.rename)
const write = promisify(fs.writeFile)

const files = [
  { name: 'model', maxCount: 1 }, 
  { name: 'properties', maxCount: 1 }
]

const upload = multer({ dest: `${ROOT_FOLDER}/uploads` }).fields(files)

const ROOT_FOLDER = './tmp'

router.get('/experiments', async (req, res) => {

})

router.get('/experiments/:id', async (req, res) => {
  const file = path.join(ROOT_FOLDER, req.id, `${req.id}.json`)

  fs.readFile(file, (err, data) => {
    if (err) {
      return res.status(500).json(err)
    }
    return res.status(200).json(data)
  })
})

router.post('/experiments', async (req, res) => {
  const id = uuid()
  const folder = `${ROOT_FOLDER}/${id}`
  const checker = req.body.checker
  
  if (!['prism', 'storm'].includes(checker)) {
    return res.status(400).json({message: 'Only prism and storm are allowed for checker'})
  }

  const experiment = {
    id: id,
    folder: folder,
    checker: checker,
    model: path.join(folder, req.files.model[0].originalname),
    properties: path.join(folder, req.files.properties[0].originalname)
  }

  try {
    await mkdir(folder)
    await write(path.join(folder, `${id}.json`), JSON.stringify(experiment))
  } catch (err) {
    res.status(500).json(err)
  }
  
  const upload = multer({ dest: folder }).fields(files)
  
  upload(req, res, async err => {
    if (err) {
      return res.status(500).json(err) 
    }

    let file = req.files.model[0]
    await mv(file.path, experiment.model)

    file = req.files.properties[0]
    await mv(file.path, experiment.properties)
  })

  return res.status(201).header('Location', `/experiments/${id}`).send()
})

module.exports = router
