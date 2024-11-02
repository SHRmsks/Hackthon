import express from 'express';
import WebSocket from 'ws';
const app =express();
const PORT = 3000; 
const wss = new WebSocket.Server(); 
wss.on('connection', (ws)=> {
    console.log('client has connected to ws server'); 
    ws.on('message', async(message)=> {
        console.log("recieved the client's message", message); 
        const result = await gettingfeeback(message); 
        ws.send(JSON.stringify(result)); 
    }); 
    

})


const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
}

);
async function gettingfeeback(imageData) {
    try {
        const yoloServerURL = 'ws://your-aws-instance-url/ws'; // Replace with your AWS YOLO WebSocket endpoint
        const yoloSocket = new WebSocket(yoloServerURL);

        yoloSocket.on('open', () => {
            yoloSocket.send(imageData); // Send image data to YOLO WebSocket server
        });

        return new Promise((resolve) => {
            yoloSocket.on('message', (data) => {
                resolve(JSON.parse(data));
                yoloSocket.close();
            });
        });
    } catch (error) {
        console.error('Error communicating with YOLO server:', error);
        return { error: 'Failed to process image' };
    }
}