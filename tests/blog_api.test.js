const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const blogConsts = require('./blogs_for_test')
const helper = require('./test_helper')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = blogConsts.blogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as JSON', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(6)
})

test('all blogs have identifier id, which is unique', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => expect(blog.id).toBeDefined())
})

test('new blog is created', async () => {
  const newBlog = {
    title: 'New blogpost',
    author: 'them',
    url: 'does.not.exist',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  // check that length has increased
  const newBlogs = await helper.blogsInDb()
  expect(newBlogs).toHaveLength(blogConsts.blogs.length + 1)

  // check that new blog exists
  expect(newBlogs.map(blog => blog.title)).toContain(newBlog.title)
  expect(newBlogs.map(blog => blog.author)).toContain(newBlog.author)
})


afterAll(() => {
  mongoose.connection.close()
})
