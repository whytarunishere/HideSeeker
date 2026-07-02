const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public')); // Serves frontend files

let players = {};
let gameStarted = false;

// Function to generate a random color
function randomColor() {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    return colors[Math.floor(Math.random() * colors.length)];
}

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Initialize new player
    players[socket.id] = {
        x: 400,
        y: 300,
        role: 'hider', // Default role
        color: randomColor() // Assign a random color for visibility
    };

    // Send existing players list to the new connect
    socket.emit('currentPlayers', players);
    // Notify others
    socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

    // Handle MVP Game Loop Trigger (1 Seeker, 9 Hiders)
    if (Object.keys(players).length === 10 && !gameStarted) {
        startGame();
    }

    // Handle movement updates from clients
    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            // Broadcast updated positions to all players
            io.emit('playerMoved', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y });
        }
    });

    // Handle tag/seeking mechanic
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

function startGame() {
    gameStarted = true;
    const playerIds = Object.keys(players);
    // Randomly assign 1 seeker
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