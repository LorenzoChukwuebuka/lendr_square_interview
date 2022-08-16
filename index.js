const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const cors = require('cors')
const helmet = require('helmet')
const userRoutes = require('./routes/userRoutes')

const knex = require('knex')

const knexFile = require('./knexfile').development

const db = knex(knexFile)

app.use(helmet())
app.use(express.static('public'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', userRoutes)
app.use('/',(req,res)=>{
    res.send('<h4> Welcome to the app </h4>')
})

const PORT = process.env.PORT || 8081

app.listen(PORT, console.log(`Server running on ${PORT}`))
