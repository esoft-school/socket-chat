const express = require("express");
const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.get('/', (req, res) => {
	res.render('index')
})
server = app.listen("3001", () => console.log("Server is running..."));

const io = require("socket.io")(server);

io.on('connection', (socket) => {
	console.log('New user connected')

	socket.username = "Guest"

    socket.on('change_username', (data) => {
        console.log(socket.username + ' change username on ' + data.username)
        socket.username = data.username
    })

    socket.on('new_message', (data) => {
        io.sockets.emit('add_message', {message : data.message, username : socket.username, className:data.className});
        console.log(socket.username +' send message ' + data.message)
    })

    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username})
        console.log(socket.username +' typing')
    })
})
