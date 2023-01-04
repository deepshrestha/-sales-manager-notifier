const express = require('express');
const cors = require('cors');
const webSocketHelper = require('./src/helpers/WebSocketHelper')
const webSocketResponseType = require('./config/WebSocketResponseTypes');

const app = express();

const corsOptions = {
    origin: 'http://localhost:8000',
    optionsSuccessStatus: 200 
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const webSocketServer = webSocketHelper.connect();

const port = 3001;

app.post("/push-notifications", (req, res) => {
    webSocketServer.clients.forEach((client) => {
        if(req.body.notifiableUserIds.includes(+client.id)) {
            client.send(JSON.stringify({
                "type": webSocketResponseType.NOTIFICATIONS,
                "message": req.body.message,
                "notifiableUserIds": req.body.notifiableUserIds
            }));
        }
    });
    res.status(200).send('Notification sent');
});

app.listen(port, () => {
    console.log(`Server running at port: ${port}`);
});