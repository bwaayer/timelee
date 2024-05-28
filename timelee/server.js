const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let state = {
  currentActivity: '',
  currentDuration: 300, // Default 5 minutes
  nextActivity: '',
  activities: [],
  startTime: Date.now()
};

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', ws => {
  // Send the current state to the new client, adjusting for elapsed time
  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const currentDuration = state.currentDuration - elapsed;
  ws.send(JSON.stringify({ ...state, currentDuration }));

  ws.on('message', message => {
    const data = JSON.parse(message);

    // Update the server state
    state = { ...state, ...data, startTime: Date.now() };

    // Broadcast updates to all connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const currentDuration = state.currentDuration - elapsed;
        client.send(JSON.stringify({ ...state, currentDuration }));
      }
    });
  });
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});
