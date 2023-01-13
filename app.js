const http = require("http");
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const webSocketResponseType = require('./config/WebSocketResponseTypes');
const url = require("url");

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
    const location = url.parse(req.url, true);

    switch(location.pathname) {
        case "/sales-app" : 
            if(location.query.id) {
                let connectedClient = Array.from(wss.clients).find(client => client.id === location.query.id)
                if(connectedClient === undefined){
                    ws.id = location.query.id;
                    ws.pathsource = location.pathname;
                    console.log("System client connected", ws.id);
                    ws.on('message', function message(data) {
                        console.log('received => %s', data);
                    });
                }
            } else {
                console.log("system client couldn't connect. user id not found")
            }
            break;

        case "/mobile-app" :
            if(location.query.memberId) {
                let connectedClient = Array.from(wss.clients).find(client => client.memberId === location.query.memberId)
                if(connectedClient === undefined){
                    ws.memberId = location.query.memberId;
                    ws.type = location.query.type;
                    ws.pathsource = location.pathname;
                    console.log("Mobile client connected", ws.memberId);
                    ws.on('message', function message(data) {
                        console.log('received => %s', data);
                    });
                }
            } else {
                console.log("mobile client couldn't connect. member id not found")
            }
            break;

        default:
            console.log("Websocket not available")
            break;
    }
});

wss.on("close", () => {
    console.log("Client disconnected");
});

wss.onerror = function () {
    console.log("Some Error occurred on ws");
}

const port = 3001;

app.post("/sales-app/push-notifications", (req, res) => {
    if(socket) {
        wss.clients.forEach((client) => {
            if(client.pathsource === "/sales-app" && req.body.notifiableUserIds.includes(+client.id)) {
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

app.post("/mobile-app/topup-notifications", (req, res) => {
    if(socket) {
        wss.clients.forEach((client) => {
            if(
                client.pathsource === "/mobile-app" && 
                client.type === webSocketResponseType.MOBILE_TOPUP &&
                req.body.memberId === client.memberId 
            ) {
                client.send(JSON.stringify({
                    "type": client.type,
                    "message": req.body.message
                }));
            }
        });
        res.status(200).send('Mobile Topup Notification Sent');
    }
})

server.listen(port, () => {
    console.log(`Server running at port: ${port}`);
});