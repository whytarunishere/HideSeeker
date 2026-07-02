const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = {};
let gameStarted = false;

function randomColor() {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    return colors[Math.floor(Math.random() * colors.length)];
}

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    players[socket.id] = {
        x: 400,
        y: 300,
        role: 'hider',
        color: randomColor()
    };

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

    if (Object.keys(players).length === 10 && !gameStarted) {
        startGame();
    }

    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].direction = movementData.direction; 
            players[socket.id].isMoving = movementData.isMoving;
        }
    });

    socket.on('playerTag', (taggedId) => {
        if (players[socket.id] && players[socket.id].role === 'seeker') {
            if (players[taggedId]) {
                players[taggedId].role = 'spectator';
                players[taggedId].color = 'gray';
                io.emit('playerTagged', { id: taggedId });
                checkWinCondition();
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// FIXED TICK RATE NETWORK LOOP (30 Ticks per second)
setInterval(() => {
    if (Object.keys(players).length > 0) {
        io.emit('stateUpdate', players);
    }
}, 1000 / 30); 

function startGame() {
    gameStarted = true;
    const playerIds = Object.keys(players);
    const seekerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    
    playerIds.forEach(id => {
        if (id === seekerId) {
            players[id].role = 'seeker';
            players[id].color = 'red';
        } else {
            players[id].role = 'hider';
            players[id].color = 'blue';
        }
    });
    io.emit('gameStarted', players);
}

function checkWinCondition() {
    const activeHiders = Object.values(players).filter(p => p.role === 'hider');
    if (activeHiders.length === 0) {
        io.emit('gameOver', { winner: 'seeker' });
        gameStarted = false;
    }
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));