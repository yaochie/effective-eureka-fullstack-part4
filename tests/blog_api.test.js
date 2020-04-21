const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const blogConsts = require('./blogs_for_test')
const helper = require('./test_helper')
const api = supertest(app)

mongoose.set('useFindAndModify', false)

beforeEach(async () => {
  // delete all blogs, delete all users
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()

  // add all blogs as root
  const blogObjects = blogConsts.blogs.map(blog => {
    return new Blog({ ...blog, user: user._id })
  })
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('viewing all blogs', () => {
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
})

const getUserToken = async () => {
  const userInfo = {
    username: 'root',
    password: 'sekret'
  }
  const response = await api
    .post('/api/login')
    .send(userInfo)

  return response.body.token
}

describe('blog creation', () => {
  test('new blog is created', async () => {
    const newBlog = {
      title: 'New blogpost',
      author: 'them',
      url: 'does.not.exist',
      likes: 0
    }

    // get token
    const token = await getUserToken()

    const savedBlog = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const savedId = savedBlog.body.id

    // check that length has increased
    const newBlogs = await helper.blogsInDb()
    expect(newBlogs).toHaveLength(blogConsts.blogs.length + 1)

    // check that new blog exists
    const foundBlog = await newBlogs.find(blog => blog.id === savedId)

    expect(foundBlog).toBeDefined()
    expect(foundBlog.title).toEqual(newBlog.title)
    expect(foundBlog.author).toEqual(newBlog.author)
    expect(foundBlog.url).toEqual(newBlog.url)
    expect(foundBlog.likes).toEqual(newBlog.likes)
  })

  test('default likes is 0', async () => {
    const newBlog = {
      title: 'New blogpost (2)',
      author: 'us',
      url: 'will.not.exist',
    }

    const token = await getUserToken()
    const savedBlog = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const savedId = savedBlog.body.id

    const newBlogs = await helper.blogsInDb()
    const foundBlog = await newBlogs.find(blog => blog.id === savedId)

    expect(foundBlog.likes).toEqual(0)
  })

  test('title and url required', async () => {
    const newBlog = {
      author: 'I',
      likes: 100
    }

    const token = await getUserToken()
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })
})

describe('deletion of a blogpost', () => {
  test('succeeds if id is valid', async () => {
    const startBlogs = await helper.blogsInDb()
    const blog = startBlogs[0]

    const token = await getUserToken()
    await api
      .delete(`/api/blogs/${blog.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)
  })
})

describe('updating a blogpost', () => {
  test('succeeds', async () => {
    const startBlogs = await helper.blogsInDb()
    const blog = startBlogs[0]

    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1
    }

    const newBlog = await api
      .put(`/api/blogs/${blog.id}`)
      .send(updatedBlog)
      .expect(200)

    expect(newBlog.body.likes).toEqual(blog.likes + 1)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
