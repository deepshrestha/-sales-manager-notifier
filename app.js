const http = require("http");
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const webSocketResponseType = require('./config/WebSocketResponseTypes');

const app = express();

const server = http.createServer(app);

let socket = null;

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const wss = new WebSocket.Server({server: server});

wss.on('connection', function connection(ws, req) {
    socket = ws;
    if(req.url.split('?').length > 1) {
        ws.id = req.url.split('?')[1].split('=')[1]
        console.log("client connected", ws.id)
        ws.on('message', function message(data) {
            console.log('received => %s', data);
        });
    } else {
        console.log("client couldn't connect. user id not found")
    }
    
});

wss.on("close", () => {
    console.log("Client disconnected");
});

wss.onerror = function () {
    console.log("Some Error occurred");
}

const port = 3001;

app.post("/push-notifications", (req, res) => {
    console.log(socket)
    if(socket) {
        wss.clients.forEach((client) => {
            if(req.body.notifiableUserIds.includes(+client.id)) {
                client.send(JSON.stringify({
                    "type": webSocketResponseType.NOTIFICATIONS,
                    "message": req.body.message,
                    "notifiableUserIds": req.body.notifiableUserIds
                }));
            }
        });
        res.status(200).send('Notification sent');
    }
    
});

server.listen(port, () => {
    console.log(`Server running at port: ${port}`);
});