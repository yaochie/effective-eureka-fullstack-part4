const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  return response.json(blogs.map(blog => blog.toJSON()))
})

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.post('/', async (request, response, next) => {
  // authenticate
  const authToken = getTokenFrom(request)
  const decodedToken = authToken === null
    ? null
    : jwt.verify(authToken, process.env.SECRET)
  
  if (authToken === null || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid'})
  }
  const user = await User.findById(decodedToken.id)

  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  // add blog to user's blogs
  user.blogs = user.blogs.concat(blog)
  await user.save()

  try {
    const result = await blog.save()
    response.status(201).json(result.toJSON())
  } catch(exception) {
    response.status(400).end()
    next(exception)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  // only update likes
  const blog = {
    likes: body.likes
  }

  console.log(blog)

  try {
    const updatedBlog = await Blog
      .findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(200).json(updatedBlog.toJSON())

  } catch(exception) {
    next(exception)
  }
})

module.exports = blogsRouter

