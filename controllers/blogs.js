const mongoose = require('mongoose')
const { request, response } = require('../app')

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')
const usersRouter = require('./users')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)
  })
  
blogsRouter.post('/', userExtractor, async (request, response) => {
    const body = request.body

    const user = request.user
    
    if (!user) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
    })

    if (!blog.likes) blog.likes = 0

    if (blog.title && blog.url) {
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        response.status(201).json(savedBlog)
    } else {
        response.status(400).end()
    }
  })

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
    const token = request.token
    const blog = await Blog.findById(request.params.id)

    if (!token || (request.user.id != blog.user.toString())) {
        return response.status(401).json({ error: 'No token or invalid user'})
    }

    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes 
    }

    const changedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })

    response.json(changedBlog)
})

module.exports = blogsRouter