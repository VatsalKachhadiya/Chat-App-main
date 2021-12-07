const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { genMsg,genImg } = require('./utils/msg')
const {
    addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')
const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('New Web socket Connection')
    
    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id:socket.id,username,room})

        if(error)
        {
            return callback(error)
        }


        socket.join(user.room)

        socket.emit('message',genMsg('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message',genMsg('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        
        callback()

    })
    socket.on('message',(msg,callback)=>{
       const userID = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback("Profanity is not allowed")
        }
        io.to(userID.room).emit('message',genMsg(userID.username,msg))
        callback()
    })
    socket.on('sendLocation',(cords,callback)=>{
        const userlocID = getUser(socket.id)
        const user = getUser(socket.id)
        io.to(userlocID.room).emit('locationMessage',genImg(user.username,`https://google.com/maps?q=${cords.lat},${cords.long}`))
        callback()
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',genMsg('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
       
    })
})


server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})