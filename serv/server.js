const app = require("express");
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

var texts = [];

const sendTexts = function() {
    let avgX = 0,
        avgY = 0;
    texts.forEach(val => {
        avgX += val.data.x;
        avgY += val.data.y;
    });
    avgX /= texts.length;
    avgY /= texts.length;
    console.log(texts[0]);
    io.emit('textupdate', {texts: texts, avg: {x: avgX, y: avgY}});
}

io.on('connection', (socket) => {
    console.log("a user connected");
    sendTexts();
    socket.on('text', (text) => {
        texts.push({
            user: socket.user,
            data: text
        });
        // io.emit('textupdate', texts);
        sendTexts();
    });
// socket.on('disconnect', (socket) => {
//     console.log("a user disconnected");
//     io.sockets.clients().forEach((sock) => {
//         console.log(sock);
//     });
// });


});

http.listen(9001, () => {
    console.log("listening on *:9001");
});