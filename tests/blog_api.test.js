const { application } = require('express')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const logger = require('../utils/logger')
const helper = require('./test_helper')
const bcrypt = require('bcryptjs')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

let authorization

beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'root toot', passwordHash})

    await user.save()

    const logInUser = {
        username: 'root',
        password: 'sekret'
    }

    const result = await api
        .post('/api/login')
        .send(logInUser)

    const token = result.body.token
    authorization = {
        Authorization: `bearer ${token}`
    }

    await Blog.deleteMany({})
    let blogObject = new Blog(helper.initialBlogs[0])
    blogObject.user = user
    await blogObject.save()
    blogObject = new Blog(helper.initialBlogs[1])
    blogObject.user = user
    await blogObject.save()
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-type', /application\/json/)
})

test('there are 0 blogs', async () => {
    await Blog.deleteMany({})
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(0)
})

test('blogs identification fields name must be id', async () => {
    const response = await api.get('/api/blogs')

    for (i = 0; i < response.body.length; i++) {
        expect(response.body[i].id).toBeDefined()
    }
})

test('a blog can be added', async () => {
    const newBlog = {
        title: "Uusi blogi",
        author: "Late Jääski",
        url: "http://www.jokutesti.jotain",
        likes: 8
    }

    await api
        .post('/api/blogs')
        .set(authorization)
        .send(newBlog)
        .expect(201)
        .expect('Content-type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain(
        'Uusi blogi'
    )
})

test('automatically set likes to 0 if likes are not set', async () => {
    const newBlog = {
        title: "asetetaan likes 0",
        author: "latejay",
        url: "http://www.late.jay",
        likes: ''
    }

    await api
        .post('/api/blogs')
        .set(authorization)
        .send(newBlog)
        .expect(201)
        .expect('Content-type', /application\/json/)

    const response = await api.get('/api/blogs')

    expect(response.body[response.body.length - 1].likes).toBe(0)
})

test('non valid blog can not be added', async () => {
    const newBlog = {
        title: "",
        author: "Late Jääski",
        url: "",
        likes: 8
    }

    await api
        .post('/api/blogs')
        .set(authorization)
        .send(newBlog)
        .expect(400)

    const response = await api.get('/api/blogs')

    expect(response.body.length).toBe(helper.initialBlogs.length)
})

test('delete specific blog succeeds with status 204', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    logger.info('AUTHORIZATION', authorization)
    logger.info('BLOGI', blogToDelete)

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set(authorization)
        .expect(204)
    
    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)

    expect(titles).not.toContain(blogToDelete.title)
})

test('change likes on a blog', async () => {
    const startBlogs = await helper.blogsInDb()
    const blogToChange = startBlogs[0]
    
    const newBlog = blogToChange
    newBlog.likes = 15

    await api
        .put(`/api/blogs/${blogToChange.id}`)
        .send(newBlog)
        .expect(200)

    const endBlogs = await helper.blogsInDb()
    const changedBlog = endBlogs[0]

    expect(changedBlog.likes).toBe(newBlog.likes)
})

test('adding blog fails with code 401 when no token', async () => {
    const newBlog = {
        title: "Uusi blogi",
        author: "Late Jääski",
        url: "http://www.jokutesti.jotain",
        likes: 8
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-type', /application\/json/)
})

describe('when there is initially one user in db', () => {
 

    test('successful user creation with statuscode 201', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'getmogged',
            name: 'Kyriakos Mog',
            password: 'weightfull'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('can not create user without username or password', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser1 = {
            username: '',
            name: 'Kyriakos Mog',
            password: 'weightfull'
        }
        const newUser2 = {
            username: 'getmogged',
            name: 'Kyriakos Mog',
            password: ''
        }

        await api
            .post('/api/users')
            .send(newUser1)
            .expect(400)
        
        await api
            .post('/api/users')
            .send(newUser2)
            .expect(400)
        
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('username and password minimum 3 characters', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser1 = {
            username: 'km',
            name: 'Kyriakos Mog',
            password: 'weightfull'
        }
        const newUser2 = {
            username: 'getmogged',
            name: 'Kyriakos Mog',
            password: 'wf'
        }

        await api
            .post('/api/users')
            .send(newUser1)
            .expect(400)
        await api
            .post('/api/users')
            .send(newUser2)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('username must be unique', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Kyriakos Mog',
            password: 'weightfull'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})

afterAll(() => {
    mongoose.connection.close()
})