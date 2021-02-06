const app = require("express");
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

var texts = [];

io.on('connection', (socket) => {
    console.log("a user connected");
    socket.on('text', (text) => {
        texts.push({
            user: socket.user,
            data: text
        });
        io.emit('textupdate', texts);
    });
});


http.listen(9001, () => {
    console.log("listening on *:9001");
});