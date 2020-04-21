const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')

const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const middleware = require('./utils/middleware')

const mongoose = require('mongoose')

mongoose.connect(
  config.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connecting to MongoDB', error.message)
  })

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)

module.exports = app

