require("dotenv").config();
const fs = require("fs");
const app = require("express");
const { connected } = require("process");

let DEV = false;

if (process.env.DEVELOPMENT) {
    console.log("Starting server in development mode");
    DEV = true;
}

const https = DEV ? require("http").Server(app) :
                                require("https").createServer(app);
// const https = require("https").createServer({
// 	key: fs.readFileSync('/opt/bitnami/letsencrypt/certificates/jatkin.dev.key'),
// 	cert: fs.readFileSync('/opt/bitnami/letsencrypt/certificates/jatkin.dev.crt')
// },app);
const io = require("socket.io")(https, {
    cors: {
	    origin: "http://127.0.0.1:9000",
	    methods: ["GET", "POST"]
    }
});

var texts = [];
const connectedUsers = {};


const sendTexts = function() {
    io.emit('textUpdate', {texts: texts});
}

const sendUserUpdate = function() {
    io.emit("userUpdate", Object.values(connectedUsers));
};

io.on('connection', (socket) => {
    console.log("a user connected");

    connectedUsers[socket.id] = socket.id;

    sendUserUpdate();
    sendTexts();
    socket.on('text', (text) => {
        console.log(`Text from user ${socket.id}`);
        console.log(text);
        texts.push({
            user: socket.id,
            data: text
        });
        // io.emit('textupdate', texts);
        sendTexts();
    });

    socket.on('nicknameUpdate', (nick) => {
        connectedUsers[socket.id] = nick;
        sendUserUpdate();
    });

    socket.on('disconnect', (socket2) => {
        console.log(`User ${socket2.id} disconnected`);
        // connectedUsers.splice(connectedUsers.indexOf(socket2.id));
        delete connectedUsers[socket.id];
        sendUserUpdate();
    });
});



https.listen(9001, () => {
    console.log("listening on *:9001");
});
