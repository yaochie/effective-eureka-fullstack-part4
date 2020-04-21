const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')

const User = require('../models/user')
const helper = require('./test_helper')
const api = supertest(app)

describe('creating new user when at least one user already exists', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creating user without username fails', async () => {
    const newUser = {
      name: 'New User',
      password: 'woooo',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Username not provided')
  })

  test('creating user without password fails', async () => {
    const newUser = {
      username: 'newuser',
      name: 'New User',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password not provided')
  })

  test('creating user with too-short username fails', async () => {
    const newUser = {
      username: 'me',
      name: 'New User',
      password: 'password',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be at least 3 characters long')
  })

  test('creating user with too-short password fails', async () => {
    const newUser = {
      username: 'newuser',
      name: 'New User',
      password: 'hi',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password must be at least 3 characters long')
  })

  test('creating user with same username fails', async () => {
    const newUser = {
      username: 'root',
      password: 'skreet'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('expected `username` to be unique')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
