import io from "socket.io-client";
import settings from './settings';
import { UsersList } from './ui';

const SocketIO = (function () {
    const HOSTNAME = settings.developmentMode ? "http://127.0.0.1" : "https://jatkin.dev";
    const PORT = "9001";
    const url = `${HOSTNAME}:${PORT}`;

    const socket = io(url);

    socket.emit("myIdRequest");

    console.log(socket);

    const listeners = {};

    const addListener = function(name, cb) {
        listeners[name] = cb;
        socket.on(name, cb);
    };

    const emit = function(name, data) {
        console.log("emitting");
        socket.emit(name,data);
    };

    // socket.on('textUpdate', (data) => {
    //     texts = data.texts;
    //     avg = data.avg;
    //     console.log('text update');
    // });


    const sendText = function (text) {
        console.log(`sending text: ${text.value}`);
        console.log(text);
        socket.emit('text', text);
    };

    const nicknameUpdate = function () {
        socket.emit('nicknameUpdate', UserNick);
    };

    return {
        addListener: addListener,
        emit: emit,
        sendText: sendText,
        nicknameUpdate: nicknameUpdate
    };

})();

export default SocketIO;