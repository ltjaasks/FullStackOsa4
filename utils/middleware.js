const { response } = require('../app')
const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = async (request, response, next) => {
    const authorization = await request.get('authorization')

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        request.token = authorization.substring(7)
    }
    next()
}

const userExtractor = async (request, response, next) => {
    const token = request.token

    if (!token) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    request.user = await User.findById(decodedToken.id)
    
    next()
}

module.exports = {
    tokenExtractor, userExtractor
}