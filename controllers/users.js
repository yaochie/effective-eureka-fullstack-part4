const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
  const body = request.body

  if (body.username === undefined) {
    return response.status(400).json({ error: 'Username not provided' })
  }
  if (body.password === undefined) {
    return response.status(400).json({ error: 'Password not provided' })
  }
  if (body.username.length < 3) {
    return response.status(400).json({ error: 'username must be at least 3 characters long' })
  }
  if (body.password.length < 3) {
    return response.status(400).json({ error: 'password must be at least 3 characters long' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })

  try {
    const savedUser = await user.save()
    response.json(savedUser)
  } catch(exception) {
    return next(exception)
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { title: 1, url: 1, author: 1 }) 
  response.json(users.map(u => u.toJSON()))
})

usersRouter.delete('/:id', async (request, response, next) => {
  try {
    await User.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch(exception) {
    next(exception)
  }
})

module.exports = usersRouter

