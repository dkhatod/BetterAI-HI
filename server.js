require('dotenv').config();
const express = require('express');
const ws = require('ws');
const http = require('http');
const app = express();
const server = http.createServer(app);
const wss = new ws.Server({ noServer: true });
const pg = require('pg');
const { Pool } = pg;
const pool = new Pool({
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DBPORT,
    database: process.env.DATABASE,
    idleTimeoutMillis: 1000
});

app.use(express.static('public'));

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            console.log('' + message)
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send('' + message);
            }
        });
        const VALUES = ['' + message]
        query =`INSERT INTO message_data.message (message_content)
        VALUES ($1)`
        pool.query(query, VALUES)

    });
    


});

server.listen(3000, () => {
    console.log('Server online');
});
