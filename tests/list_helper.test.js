const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('totalLikes', () => {
  test('of no blogs is zero', () => {
    const blogs = []

    expect(listHelper.totalLikes(blogs)).toBe(0)
  })

  test('of one blog is correct', () => {
    const blogs = [
      {
        '_id': '5e9dc763930ba00427236b1f',
        'title': 'My First Post',
        'author': 'me',
        'url': 'stuff.me',
        'likes': 5,
        '__v': 0
      },
    ]

    expect(listHelper.totalLikes(blogs)).toBe(5)
  })

  test('of many blogs is correct', () => {
    const blogs = [
      {
        '_id': '5e9dc763930ba00427236b1f',
        'title': 'My First Post',
        'author': 'me',
        'url': 'stuff.me',
        'likes': 5,
        '__v': 0
      },
      {
        '_id': '5e9dc7da930ba00427236b20',
        'title': 'My Second Post',
        'author': 'me',
        'url': 'morestuff.me',
        'likes': 10,
        '__v': 0
      },
      {
        '_id': '5e9dcda54346da156bcaf8d9',
        'title': 'My Third Post',
        'author': 'me',
        'url': 'evenmorestuff.me',
        'likes': 13,
        '__v': 0
      }
    ]

    expect(listHelper.totalLikes(blogs)).toBe(28)
  })
})
