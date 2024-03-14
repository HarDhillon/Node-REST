require('dotenv').config();

const path = require('path')
const express = require('express');
const mongoose = require('mongoose')
const multer = require('multer')
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')
// ===========================================


const app = express();

// ========= Start File Storage =========

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)

    }
}

// ========= End File Storage =========

app.use(express.json())

app.use(
    multer(
        {
            storage: fileStorage,
            fileFilter: fileFilter
        })
        .single('image')
)

app.use('/images', express.static(path.join(__dirname, 'images')))

// Allow CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message;
    const data = error.data

    res.status(status).json({
        message: message,
        data: data
    })
})

app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true
}))

mongoose.connect(process.env.MONGODB_URI)
    .then(result => {
        const server = app.listen(8080)
        console.log('Success')
    }).catch(err => console.log(err))