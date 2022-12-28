const { request, response } = require('../app')
require('express-async-errors')
const usersRouter = require('express').Router()
const User = require('../models/user')
const logger = require('../utils/logger')
const bcrypt = require('bcryptjs')

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 })

    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    const existingUser = await User.findOne({ username })
    if (existingUser) {
        return response.status(400).json({
            error: 'username must be unique'
        })
    }

    if (!username || !password) {
        return response.status(400).json({
            error: 'username or password missing'
        })
    }

    if (username.length < 3 || password.length < 3) {
        return response.status(400).json({
            error: 'username or password is too short'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()
    logger.info(savedUser)

    response.status(201).json(savedUser)
})

module.exports = usersRouter