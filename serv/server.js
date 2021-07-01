require("dotenv").config();
const fs = require("fs");
const app = require("express");
const { connected } = require("process");

let DEV = false;

if (process.env.DEVELOPMENT) {
    console.log("Starting server in development mode");
    DEV = true;
}

const https = DEV ?
    require("http").Server(app) :   //Dev mode enabled
    require("https").createServer({ //Production
        key: fs.readFileSync('/opt/bitnami/letsencrypt/certificates/jatkin.dev.key'),
        cert: fs.readFileSync('/opt/bitnami/letsencrypt/certificates/jatkin.dev.crt')
    }, app);

const io = require("socket.io")(https, {
    cors: {
        origin: DEV ? "http://127.0.0.1:9000" : "https://jatkin.dev",
        methods: ["GET", "POST"],
        credentials: true
    }
});

var shapes = [];
var texts = [];
const connectedUsers = {};

const broadcastShapes = function () {
    io.emit('shapeUpdate', { shapes: shapes });
}

const broadcastTexts = function () {
    io.emit('textUpdate', { texts: texts });
}

const broadcastUsers = function () {
    console.log(connectedUsers);
    io.emit("userUpdate", connectedUsers);
};

const supplyUserInitialId = function (socket) {
    socket.emit("helloId", socket.id);
};


io.on('connection', (socket) => {
    console.log("User connected");

    connectedUsers[socket.id] = socket.id.substring(0, 8);   //Initial nickname     

    broadcastUsers();
    broadcastTexts();
    broadcastShapes();
    supplyUserInitialId(socket);

    socket.on('newShape', (shape) => {
        console.log(`Shape from user ${socket.id}`);
        console.log(shape);
        shapes.push({
            user: socket.id,
            data: shape
        });
        broadcastShapes();
    });

    socket.on('hello', () => {
        console.log("Hello!");
    });

    socket.on('text', (text) => {
        console.log(`Text from user ${socket.id}`);
        console.log(text);
        texts.push({
            user: socket.id,
            data: text
        });
        broadcastTexts();
    });

    socket.on('nicknameUpdate', (nick) => {
        connectedUsers[socket.id] = nick;
        broadcastUsers();
    });

    socket.on('disconnect', (socket2) => {
        console.log(`User ${socket2.id} disconnected`);
        delete connectedUsers[socket.id];
        broadcastUsers();
    });
});



https.listen(9001, '0.0.0.0', () => {
    console.log("listening on *:9001");
});
