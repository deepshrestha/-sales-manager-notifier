const { WebSocketServer } = require('ws');

exports.connect = () => {
    const port = 8081;

    const wss = new WebSocketServer({ port });

    wss.on('connection', function connection(ws, req) {
        ws.id = req.url.split('?')[1].split('=')[1]
        console.log("client connected", ws.id)
        ws.on('message', function message(data) {
            console.log('received => %s', data);
        });
    
        ws.on("close", () => {
            console.log("Client disconnected");
        });
        
        ws.onerror = function () {
            console.log("Some Error occurred");
        }
    });

    return wss;
}