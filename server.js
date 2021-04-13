const express = require('express');
const bodyParser = require('body-parser');
const router = require('./app/routes');
const db = require('./app/models/db');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3001;
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(router);
app.use(bodyParser.json());

const server = app.listen(port, function () {
    console.log('Server is running on port: ' + server.address().port);
});

const io = require("socket.io")(server);

function parseCookies (request) {
    let list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        let parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

io.on('connection', (socket) => {
    console.log('New user connected');

    const name = db.getToken(parseCookies(socket.handshake).token).then((res) => {
        db.getUser(res[0].login).then( (res) => {
            console.log(res);
            socket.username = res[0].username;
        })
    });
    socket.on('change_username', (data) => {
        console.log(socket.username + ' change username on ' + data.username);
        socket.username = data.username
    });

    socket.on('new_message', (data) => {
        io.sockets.emit('add_message', {message : data.message, username : socket.username, className:data.className});
        console.log(socket.username +' send message ' + data.message)
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {username : socket.username});
        console.log(socket.username +' typing')
    })
});
