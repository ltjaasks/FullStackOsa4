const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: "Alustetaan blogit",
        author: "Late Jääski",
        url: "http://www.testaillaan.tietokantaa",
        likes: 0
    },
    {
        title: "Toinen blogi",
        author: "Artsa Virtalainen",
        url: "http://www.testiurli.joku",
        likes: 13
    }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialBlogs, blogsInDb, usersInDb
}