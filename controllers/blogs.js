const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  return response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {
  // authenticate
  const authToken = request.token
  const decodedToken = authToken === null
    ? null
    : jwt.verify(authToken, process.env.SECRET)

  if (authToken === null || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  if (user === null) {
    return response.status(401).json({ error: 'invalid token' })
  }

  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  try {
    const result = await blog.save()
    response.status(201).json(result.toJSON())

    // add blog to user's blogs
    user.blogs = user.blogs.concat(blog)
    await user.save()
  } catch(exception) {
    response.status(400).end()
    next(exception)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  // authenticate
  const authToken = request.token
  const decodedToken = authToken === null
    ? null
    : jwt.verify(authToken, process.env.SECRET)

  if (authToken === null || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  if (user === null) {
    return response.status(401).json({ error: 'invalid token' })
  }

  const blog = await Blog.findById(request.params.id)
  if (blog === null) {
    return response.status(404).json({ error: 'blog not found' })
  }

  // check that user is creator of blog
  if (blog.user === undefined || !(blog.user.toString() === user._id.toString())) {
    return response.status(401).json({ error: 'blog can only be deleted by creator' })
  }

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

  try {
    const updatedBlog = await Blog
      .findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(200).json(updatedBlog.toJSON())

  } catch(exception) {
    next(exception)
  }
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    console.log(blog)
    response.json(blog.toJSON())
  } catch(exception) {
    response.status(404).end()
    next(exception)
  }
})

blogsRouter.post('/:id/comments', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    const body = request.body

    if (!body.comment) {
      return response.status(400).json({ error: 'no comment found' })
    }

    const blogData = blog.toJSON()
    const newBlog = {
      ...blogData,
      comments: blogData.comments.concat(body.comment)
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      newBlog,
      { new: true }
    )

    response.status(200).json(updatedBlog.toJSON())
  } catch(exception) {
    response.status(404).end()
    next(exception)
  }
})

module.exports = blogsRouter

