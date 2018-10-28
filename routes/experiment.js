const express = require('express')
const router = express.Router()
const { promisify } = require('util')
const path = require('path')

const uid = require('cuid');
const multer  = require('multer')

const fs = require('fs')
const mkdir = promisify(fs.mkdir)
const write = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)

const files = [
  { name: 'model', maxCount: 1 }, 
  { name: 'properties', maxCount: 1 }
]
const ROOT_FOLDER = './tmp'
const UPLOAD_FOLDER = `${ROOT_FOLDER}/uploads`

const upload = multer({ dest: UPLOAD_FOLDER }).fields(files)

router.get('/experiments/:id', async (req, res) => {
  const file = path.join(ROOT_FOLDER, req.params.id, `descriptor.json`)
  try {
    const descriptor = await readFile(file)
    return res.status(200).json(JSON.parse(descriptor))
  } catch (err) {
    return res.status(500).json(err)
  }
})

router.post('/experiments', upload, async (req, res) => {
  const id = uid()
  const folder = `${ROOT_FOLDER}/${id}`
  const checker = req.body.checker
  
  if (!['prism', 'storm'].includes(checker)) {
    return res.status(400).json({message: 'Only prism and storm are allowed for checker'})
  }

  const model = req.files.model[0]
  const properties = req.files.properties[0]

  const experiment = {
    id: id,
    folder: folder,
    checker: checker,
    model: model.originalname,
    properties: properties.originalname
  }

  try {
    await mkdir(folder)
    await write(path.join(folder, 'descriptor.json'), JSON.stringify(experiment))
  } catch (err) {
    res.status(500).json(err)
  }

  const err = e => {
    return res.status(500).json(err)
  }
  fs.rename(path.join(UPLOAD_FOLDER, properties.filename), path.join(experiment.folder, experiment.properties), err)
  fs.rename(path.join(UPLOAD_FOLDER, model.filename),      path.join(experiment.folder, experiment.model), err)

  return res.status(201).header('Location', `/experiments/${id}`).json(experiment)
})

module.exports = router
