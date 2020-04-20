const listHelper = require('../utils/list_helper')
const blogConsts = require('./blogs_for_test')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('totalLikes', () => {
  test('of no blogs is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  test('of one blog is correct', () => {
    expect(listHelper.totalLikes(blogConsts.single_blog)).toBe(5)
  })

  test('of many blogs is correct', () => {
    expect(listHelper.totalLikes(blogConsts.three_blogs)).toBe(28)
  })
})

describe('favoriteBlog', () => {
  test('of zero blogs is null', () => {
    expect(listHelper.favoriteBlog([])).toEqual(null)
  })

  test('of one blog is correct', () => {
    expect(listHelper.favoriteBlog(blogConsts.single_blog))
      .toEqual(blogConsts.single_blog[0])
  })

  test('of many blogs is correct', () => {
    expect(listHelper.favoriteBlog(blogConsts.three_blogs))
      .toEqual(blogConsts.three_blogs[1])
  })
})

describe('mostBlogs', () => {
  test('of no blogs is null', () => {
    expect(listHelper.mostBlogs([])).toEqual(null)
  })

  test('of single blog is correct', () => {
    expect(listHelper.mostBlogs(blogConsts.single_blog))
      .toEqual({
        author: 'me',
        blogs: 1
      })
  })

  test('of many blogs with single author is correct', () => {
    expect(listHelper.mostBlogs(blogConsts.three_blogs))
      .toEqual({
        author: 'me',
        blogs: 3
      })
  })

  test('of many blogs with many authors is correct', () => {
    expect(listHelper.mostBlogs(blogConsts.blogs))
      .toEqual({
        author: 'Robert C. Martin',
        blogs: 3
      })
  })
})

describe('mostLikes', () => {
  test('of no blogs is null', () => {
    expect(listHelper.mostLikes([])).toEqual(null)
  })

  test('of single blog is correct', () => {
    expect(listHelper.mostLikes(blogConsts.single_blog))
      .toEqual({
        author: 'me',
        likes: 5
      })
  })

  test('of single author is correct', () => {
    expect(listHelper.mostLikes(blogConsts.three_blogs))
      .toEqual({
        author: 'me',
        likes: 28
      })
  })

  test('of many blogs with many authors is correct', () => {
    expect(listHelper.mostLikes(blogConsts.blogs))
      .toEqual({
        author: 'Edsger W. Dijkstra',
        likes: 17
      })
  })
})

