const express = require('express')
const cors = require('cors')
const path = require('path')

const router = require('./routes/restapi.js')
const home = require('./routes/home.js')

const app = express()
app.use(cors())

const collaborationSessions = new Map()
const socketToSession = new Map()
const usersInfo = new Map()

const server = require('http').Server(app)
const io = require('socket.io')(server)
const socketService = require('./services/socket')(io, collaborationSessions, socketToSession, usersInfo)

app.use(express.static(path.join(__dirname, '../dist')))
app.use('/',home)
app.use('/api/v1',router)
app.use((req,res,next) => {
	res.sendFile('index.html',{root: path.join(__dirname,'../dist')})
})

server.listen(3000)
server.on('error', (err) => {
  throw err
})
