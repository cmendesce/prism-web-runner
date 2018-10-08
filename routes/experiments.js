const express = require('express');
const router = express.Router();
const uuid = require('uuid').v4;
const fs = require('fs')
const queue = require('../queue')

router.get('/:id', function(req, res, next) {
  res.status(200).send('respond with a resource ' + req.params.id);
});

router.post('/', function(req, res, next) {
  const body = req.body
  const id = uuid()

  const data = {
    id: id,
    model: body.model,
    properties: body.properties,
    params: body.params,
    commands: [],
    results: []
  }

  for (let index = 0; index < data.params.length; index++) {
    const param = data.params[index]
    const reducer = (command, prop) => `${command} -${prop} ${param[prop]}`
    const props = Object.getOwnPropertyNames(param)
    
    const result = `${id}_${index}.txt`
    data.results.push(result)
    const command = `/Users/carlosmendes/unifor/prism-web-runner/prism-4.4-osx64/bin/prism ${data.model} ${data.properties} ${props.reduce(reducer, '')} -exportresults ${result}`
    data.commands.push(command)
    const title = id
    queue.get().create('prism', {
      id, title, index, command, result
    }).save()
  }

  return res.send(data)
});

module.exports = router;
