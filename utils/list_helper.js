const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const reducer = (max, blog) => {
    return Math.max(max, blog.likes)
  }

  const maxLikes = blogs.reduce(reducer, 0)

  return blogs.find(blog => blog.likes === maxLikes)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const reducer = (counts, blog) => {
    if (counts.has(blog.author)) {
      counts.set(blog.author, counts.get(blog.author) + 1)
    } else {
      counts.set(blog.author, 1)
    }
    return counts
  }

  const authorCounts = blogs.reduce(reducer, new Map())

  let max = { author: '', blogs: 0 }
  for (let [key, value] of authorCounts.entries()) {
    if (value > max.blogs) {
      max = { author: key, blogs: value }
    }
  }

  return max
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}

